import { Document } from '@langchain/core/documents';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pdf as renderPdfToImages } from 'pdf-to-img';
import { DmsService } from 'src/dms/dms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnstructuredClient } from 'unstructured-client';
// import { Strategy } from 'unstructured-client/dist/commonjs/sdk/models/shared';
import { v4 as uuidv4 } from 'uuid';
import { QdrantService } from './qdrant.service';
import { SmartPdfService } from './smart-pdf.service';

interface ManualExternalMetadata {
	s3Key: string | null;
	carModel: string | null;
	vectorRef: string | null;
}

@Injectable()
export class DocumentParserService {
	private readonly logger = new Logger(DocumentParserService.name);
	private readonly qdrantBatchSize = 64;
	private readonly maxPageContentLength = 3500;
	private readonly maxHtmlMetadataLength = 6000;
	private readonly fullPageImageScale = 2;
	private unstructuredClient: UnstructuredClient;

	constructor(
		private readonly dmsService: DmsService,
		private readonly qdrantService: QdrantService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly smartPdfService: SmartPdfService,
	) {
		// Підключаємося до нашого локального Docker-контейнера (або хмарного API)
		const serverURL =
			this.configService.get<string>('UNSTRUCTURED_API_URL') ||
			'http://localhost:8000';
		this.unstructuredClient = new UnstructuredClient({
			serverURL,
			retryConfig: { strategy: 'none' },
		});
	}

	/**
	 * Головний метод для обробки завантаженого PDF мануалу
	 */
	async processAndStoreManual(file: Express.Multer.File, carModel: string) {
		this.logger.log(
			`Починаємо AI-парсинг мануалу для: ${carModel} через Unstructured...`,
		);
		const manualVectorRef = uuidv4();

		try {
			const optimizedPdf = await this.smartPdfService.processSmartPdf(
				file.buffer,
			);
			const keptRanges = optimizedPdf.ranges;
			const keptPages = this.expandRangesToPages(keptRanges);
			const discardedRanges = this.getDiscardedRanges(
				optimizedPdf.originalPages,
				keptRanges,
			);
			const discardedPages = this.expandRangesToPages(discardedRanges);

			this.logger.log(
				`Original pages: ${optimizedPdf.originalPages}, Filtered pages: ${optimizedPdf.filteredPages}. Reduction: ${optimizedPdf.reductionPercent}%.`,
			);
			this.logger.log(
				`[SMART FILTER DEBUG] Kept ranges: ${this.formatRanges(keptRanges)}`,
			);
			this.logger.log(
				`[SMART FILTER DEBUG] Discarded ranges: ${this.formatRanges(discardedRanges)}`,
			);
			this.logger.log(
				`[SMART FILTER DEBUG] Kept pages (${keptPages.length}): ${keptPages.join(', ')}`,
			);
			this.logger.log(
				`[SMART FILTER DEBUG] Discarded pages (${discardedPages.length}): ${discardedPages.join(', ')}`,
			);

			if (optimizedPdf.mode === 'safe') {
				this.logger.warn(
					`Smart filter fallback applied for ${file.originalname}. ${optimizedPdf.reasoning}`,
				);
			}

			const { elements, mode: partitionMode } =
				await this.partitionWithFallback(
					optimizedPdf.filteredBuffer,
					file.originalname,
				);

			this.logger.log(
				`Unstructured (${partitionMode}) повернув ${elements.length} інтелектуальних блоків. Обробляємо...`,
			);

			const langchainDocs: Document[] = [];
			const pagesWithImages = new Set<number>();
			const fullPageImageUrlByPage = new Map<number, string>();
			const imageStats = {
				detectedImageElements: 0,
				missingPageNumber: 0,
				uniqueImagePages: 0,
				convertedFullPages: 0,
				uploadedFullPages: 0,
				linkedTextChunks: 0,
				conversionErrors: 0,
				outOfRangePages: 0,
			};

			for (const element of elements) {
				const pageNumber = this.normalizePageNumber(
					element.metadata?.page_number,
				);
				const metadata: Record<string, any> = {
					vectorRef: manualVectorRef,
					carModel,
					source: file.originalname,
					pageNumber,
					type: element.type,
				};

				let pageContent = element.text || '';

				if (element.type === 'Table' && element.metadata?.text_as_html) {
					metadata.html = this.truncateText(
						element.metadata.text_as_html,
						this.maxHtmlMetadataLength,
					);
					pageContent = `Таблиця з мануалу ${carModel}:\n${element.text}`;
				}

				if (element.type === 'Image') {
					imageStats.detectedImageElements += 1;
					if (pageNumber === null) {
						imageStats.missingPageNumber += 1;
						continue;
					}

					pagesWithImages.add(pageNumber);
					continue;
				}

				if (pageContent.trim().length > 0) {
					const normalizedPageContent = this.truncateText(
						pageContent,
						this.maxPageContentLength,
					);

					langchainDocs.push(
						new Document({
							pageContent: normalizedPageContent,
							metadata,
						}),
					);
				}
			}

			const needsFallback = pagesWithImages.size === 0;
			if (needsFallback) {
				// Smart filter kept pages are tracked in original PDF numbering.
				// Rendering uses filtered PDF numbering (1..filteredPages), so map by index.
				keptPages.forEach((_, index) => {
					pagesWithImages.add(index + 1);
				});

				this.logger.warn(
					`Unstructured returned 0 images (likely due to 'fast' mode fallback). Activating SmartFilter fallback: rendering all ${pagesWithImages.size} kept pages as full-page PNGs.`,
				);
			}

			const sortedPagesWithImages = [...pagesWithImages].sort((a, b) => a - b);
			imageStats.uniqueImagePages = sortedPagesWithImages.length;

			for (const pageNumber of sortedPagesWithImages) {
				if (pageNumber > optimizedPdf.filteredPages) {
					imageStats.outOfRangePages += 1;
					this.logger.warn(
						`Skipping image page ${pageNumber}: out of filtered PDF range (1-${optimizedPdf.filteredPages}).`,
					);
					continue;
				}

				try {
					const fullPageImageBuffer = await this.renderFullPagePng(
						optimizedPdf.filteredBuffer,
						pageNumber,
					);
					imageStats.convertedFullPages += 1;

					this.logger.log(
						`Знайдено схему на сторінці ${pageNumber}. Рендеримо повну сторінку і завантажуємо в S3...`,
					);

					const s3File = {
						buffer: fullPageImageBuffer,
						originalname: `${carModel.replace(/\s+/g, '_')}_fullpage_${pageNumber}_${uuidv4().slice(0, 6)}.png`,
						mimetype: 'image/png',
					} as Express.Multer.File;

					const uploadRes = await this.dmsService.uploadSingleFile({
						file: s3File,
						isPublic: true,
					});
					imageStats.uploadedFullPages += 1;
					fullPageImageUrlByPage.set(pageNumber, uploadRes.url);

					langchainDocs.push(
						new Document({
							pageContent: `Повна технічна схема/сторінка з мануалу ${carModel}. Сторінка ${pageNumber}.`,
							metadata: {
								vectorRef: manualVectorRef,
								carModel,
								imageUrl: uploadRes.url,
								fullPageImageUrl: uploadRes.url,
								pageNumber,
								source: file.originalname,
								type: 'FullPageImage',
							},
						}),
					);
				} catch (error) {
					imageStats.conversionErrors += 1;
					this.logger.warn(
						`Failed to render/upload full page image for page ${pageNumber}: ${this.formatErrorForLog(error)}`,
					);
				}
			}

			imageStats.linkedTextChunks = this.attachFullPageImageUrlsToTextDocs(
				langchainDocs,
				fullPageImageUrlByPage,
			);

			this.logger.log(
				`Full-page image summary: detectedElements=${imageStats.detectedImageElements}, uniquePages=${imageStats.uniqueImagePages}, converted=${imageStats.convertedFullPages}, uploaded=${imageStats.uploadedFullPages}, linkedTextChunks=${imageStats.linkedTextChunks}, missingPageNumber=${imageStats.missingPageNumber}, outOfRange=${imageStats.outOfRangePages}, conversionErrors=${imageStats.conversionErrors}.`,
			);

			this.logger.log(
				`Генеруємо вектори для ${langchainDocs.length} блоків і зберігаємо в Qdrant...`,
			);

			if (langchainDocs.length > 0) {
				await this.addDocumentsToQdrantInBatches(langchainDocs);
			} else {
				this.logger.warn(
					`Після smart filtering і partition не знайдено текстових блоків для ${file.originalname}.`,
				);
			}

			const manualUpload = await this.dmsService.uploadSingleFile({
				file,
				isPublic: false,
			});

			const extractedPreview = langchainDocs
				.map(doc => doc.pageContent)
				.join('\n\n')
				.slice(0, 20000);

			const manualRecord = await this.prismaService.document.create({
				data: {
					filename: file.originalname,
					content: extractedPreview || `Manual for ${carModel}`,
					externalId: this.encodeManualExternalMetadata({
						s3Key: manualUpload.key,
						carModel,
						vectorRef: manualVectorRef,
					}),
				},
			});

			this.logger.log(
				`Мануал ${carModel} успішно оброблено, картинки в S3, вектори в Qdrant!`,
			);

			return {
				success: true,
				debugMode: false,
				chunksProcessed: langchainDocs.length,
				manual: {
					id: manualRecord.id,
					filename: manualRecord.filename,
					carModel,
					createdAt: manualRecord.createdAt,
				},
				smartFilter: {
					mode: optimizedPdf.mode,
					originalPages: optimizedPdf.originalPages,
					filteredPages: optimizedPdf.filteredPages,
					reductionPercent: optimizedPdf.reductionPercent,
					keptRanges,
					discardedRanges,
					keptPages,
					discardedPages,
					reasoning: optimizedPdf.reasoning,
				},
			};
		} catch (error) {
			this.logger.error('Помилка під час AI-парсингу PDF:', error);
			throw new InternalServerErrorException(
				'Не вдалося розпарсити мануал через Unstructured',
			);
		}
	}

	async getManuals(search?: string) {
		const normalizedSearch = search?.trim().toLowerCase();

		const documents = await this.prismaService.document.findMany({
			where: {
				externalId: {
					not: null,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: 200,
		});

		return documents
			.map(doc => {
				const metadata = this.parseManualExternalMetadata(doc.externalId);
				return {
					id: doc.id,
					filename: doc.filename,
					carModel: metadata.carModel,
					createdAt: doc.createdAt,
					s3Key: metadata.s3Key,
				};
			})
			.filter(item => Boolean(item.s3Key))
			.filter(item => {
				if (!normalizedSearch) {
					return true;
				}

				const filename = item.filename.toLowerCase();
				const carModel = item.carModel?.toLowerCase() || '';

				return (
					filename.includes(normalizedSearch) ||
					carModel.includes(normalizedSearch)
				);
			})
			.map(({ s3Key, ...item }) => item);
	}

	async getManualOpenLink(id: string) {
		const manual = await this.prismaService.document.findUnique({
			where: {
				id,
			},
		});

		if (!manual) {
			throw new NotFoundException('Мануал не знайдено');
		}

		const metadata = this.parseManualExternalMetadata(manual.externalId);

		if (!metadata.s3Key) {
			throw new NotFoundException('Для цього мануалу не знайдено PDF-файл');
		}

		const { url } = await this.dmsService.getPresignedSignedUrl(metadata.s3Key);

		return {
			url,
			filename: manual.filename,
			carModel: metadata.carModel,
		};
	}

	async deleteManual(id: string) {
		const manual = await this.prismaService.document.findUnique({
			where: { id },
		});

		if (!manual) {
			throw new NotFoundException('Мануал не знайдено');
		}

		const metadata = this.parseManualExternalMetadata(manual.externalId);
		let storageCleanupPending = false;

		if (metadata.s3Key) {
			try {
				await this.dmsService.deleteFile(metadata.s3Key);
			} catch (error) {
				if (this.isS3DeleteAccessDenied(error)) {
					storageCleanupPending = true;
					this.logger.warn(
						`Manual ${manual.id}: S3 object cleanup is pending due to missing DeleteObject permission.`,
					);
				} else {
					throw error;
				}
			}
		}

		await this.qdrantService.deleteManualVectors({
			vectorRef: metadata.vectorRef,
			filename: manual.filename,
			carModel: metadata.carModel,
		});

		await this.prismaService.document.delete({
			where: { id },
		});

		return {
			id: manual.id,
			filename: manual.filename,
			carModel: metadata.carModel,
			storageCleanupPending,
		};
	}

	private encodeManualExternalMetadata(metadata: {
		s3Key: string;
		carModel: string;
		vectorRef: string;
	}) {
		return JSON.stringify(metadata);
	}

	private parseManualExternalMetadata(
		externalId: string | null,
	): ManualExternalMetadata {
		if (!externalId) {
			return {
				s3Key: null,
				carModel: null,
				vectorRef: null,
			};
		}

		try {
			const parsed = JSON.parse(externalId);
			if (parsed && typeof parsed === 'object') {
				return {
					s3Key: typeof parsed.s3Key === 'string' ? parsed.s3Key : null,
					carModel:
						typeof parsed.carModel === 'string' ? parsed.carModel : null,
					vectorRef:
						typeof parsed.vectorRef === 'string' ? parsed.vectorRef : null,
				};
			}
		} catch {
			// Backward compatibility: in legacy records externalId may contain only an S3 key.
		}

		return {
			s3Key: externalId.toLowerCase().includes('.pdf') ? externalId : null,
			carModel: null,
			vectorRef: null,
		};
	}

	private expandRangesToPages(ranges: Array<[number, number]>) {
		const pages: number[] = [];
		for (const [start, end] of ranges) {
			for (let page = start; page <= end; page++) {
				pages.push(page);
			}
		}
		return pages;
	}

	private getDiscardedRanges(
		totalPages: number,
		keptRanges: Array<[number, number]>,
	) {
		if (totalPages <= 0) {
			return [];
		}

		if (!keptRanges.length) {
			return [[1, totalPages]] as Array<[number, number]>;
		}

		const discarded: Array<[number, number]> = [];
		let cursor = 1;

		for (const [start, end] of keptRanges) {
			if (cursor < start) {
				discarded.push([cursor, start - 1]);
			}
			cursor = Math.max(cursor, end + 1);
		}

		if (cursor <= totalPages) {
			discarded.push([cursor, totalPages]);
		}

		return discarded;
	}

	private formatRanges(ranges: Array<[number, number]>) {
		if (!ranges.length) {
			return 'none';
		}

		return ranges.map(([start, end]) => `${start}-${end}`).join(', ');
	}

	private truncateText(value: unknown, maxLength: number) {
		if (typeof value !== 'string') {
			return '';
		}

		if (value.length <= maxLength) {
			return value;
		}

		return `${value.slice(0, maxLength)}...`;
	}

	private normalizePageNumber(value: unknown): number | null {
		const pageNumber = Number(value);
		if (!Number.isFinite(pageNumber) || pageNumber <= 0) {
			return null;
		}

		return Math.floor(pageNumber);
	}

	private attachFullPageImageUrlsToTextDocs(
		documents: Document[],
		fullPageImageUrlByPage: Map<number, string>,
	) {
		let linkedTextChunks = 0;

		for (const document of documents) {
			const metadata = document.metadata as Record<string, any>;
			if (!metadata || metadata.type === 'FullPageImage') {
				continue;
			}

			const pageNumber = this.normalizePageNumber(metadata.pageNumber);
			if (pageNumber === null) {
				continue;
			}

			const fullPageImageUrl = fullPageImageUrlByPage.get(pageNumber);
			if (!fullPageImageUrl) {
				continue;
			}

			metadata.fullPageImageUrl = fullPageImageUrl;
			linkedTextChunks += 1;
		}

		return linkedTextChunks;
	}

	private async renderFullPagePng(pdfBuffer: Buffer, pageNumber: number) {
		const document = await renderPdfToImages(pdfBuffer, {
			scale: this.fullPageImageScale,
		});

		if (pageNumber < 1 || pageNumber > document.length) {
			throw new Error(
				`Requested page ${pageNumber} is outside PDF bounds (1-${document.length}).`,
			);
		}

		const imageBuffer = await document.getPage(pageNumber);

		if (!imageBuffer || imageBuffer.length === 0) {
			throw new Error(
				`pdf-to-img returned an empty buffer for page ${pageNumber}.`,
			);
		}

		return imageBuffer;
	}

	private async addDocumentsToQdrantInBatches(documents: Document[]) {
		const totalBatches = Math.ceil(documents.length / this.qdrantBatchSize);

		for (let i = 0; i < documents.length; i += this.qdrantBatchSize) {
			const batchIndex = Math.floor(i / this.qdrantBatchSize) + 1;
			const batch = documents.slice(i, i + this.qdrantBatchSize);
			await this.qdrantService.vectorStore.addDocuments(batch);
			this.logger.log(
				`Qdrant batch ${batchIndex}/${totalBatches} збережено (${batch.length} документів).`,
			);
		}
	}

	private async partitionWithFallback(pdfBuffer: Buffer, fileName: string) {
		const attempts: Array<{
			mode: 'hi_res' | 'ocr_only' | 'fast';
			params: {
				strategy: any;
				coordinates: boolean;
				splitPdfPage: false;
				pdfInferTableStructure: boolean;
				extractImageBlockTypes: string[];
			};
		}> = [
			{
				mode: 'hi_res',
				params: {
					strategy: 'hi_res' as any,
					coordinates: true,
					splitPdfPage: false,
					pdfInferTableStructure: true,
					extractImageBlockTypes: ['Image'],
				},
			},
			{
				mode: 'ocr_only',
				params: {
					strategy: 'ocr_only' as any,
					coordinates: true,
					splitPdfPage: false,
					pdfInferTableStructure: false,
					extractImageBlockTypes: [],
				},
			},
			{
				mode: 'fast',
				params: {
					strategy: 'fast' as any,
					coordinates: false,
					splitPdfPage: false,
					pdfInferTableStructure: false,
					extractImageBlockTypes: [],
				},
			},
		];

		let lastError: unknown = null;

		for (const attempt of attempts) {
			try {
				this.logger.log(
					`Partition attempt: mode=${attempt.mode}, splitPdfPage=false`,
				);

				const response = await this.unstructuredClient.general.partition({
					partitionParameters: {
						files: {
							content: new Uint8Array(pdfBuffer),
							fileName,
						},
						...attempt.params,
					},
				});

				const rawResponse: any = response;
				const elements =
					rawResponse?.elements ||
					(Array.isArray(rawResponse) ? rawResponse : []);

				return {
					elements,
					mode: attempt.mode,
				};
			} catch (error) {
				lastError = error;
				this.logger.warn(
					`Partition attempt failed for mode=${attempt.mode}: ${this.formatErrorForLog(error)}`,
				);
			}
		}

		throw lastError || new Error('All partition attempts failed');
	}

	private formatErrorForLog(error: unknown) {
		if (!error) {
			return 'Unknown error';
		}

		if (error instanceof Error) {
			return error.message;
		}

		return String(error);
	}

	private isS3DeleteAccessDenied(error: unknown) {
		if (!error || typeof error !== 'object') {
			return false;
		}

		const e = error as {
			response?: {
				statusCode?: number;
			};
			message?: string;
		};

		const message = (e.message || '').toLowerCase();

		return (
			e.response?.statusCode === 403 ||
			message.includes('deleteobject access denied') ||
			message.includes('access denied')
		);
	}
}
