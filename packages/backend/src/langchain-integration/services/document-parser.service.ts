import { Document } from '@langchain/core/documents';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DmsService } from 'src/dms/dms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnstructuredClient } from 'unstructured-client';
// import { Strategy } from 'unstructured-client/dist/commonjs/sdk/models/shared';
import { v4 as uuidv4 } from 'uuid';
import { QdrantService } from './qdrant.service';

interface ManualExternalMetadata {
	s3Key: string | null;
	carModel: string | null;
}

@Injectable()
export class DocumentParserService {
	private readonly logger = new Logger(DocumentParserService.name);
	private unstructuredClient: UnstructuredClient;

	constructor(
		private readonly dmsService: DmsService,
		private readonly qdrantService: QdrantService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
	) {
		// Підключаємося до нашого локального Docker-контейнера (або хмарного API)
		const serverURL =
			this.configService.get<string>('UNSTRUCTURED_API_URL') ||
			'http://localhost:8000';
		this.unstructuredClient = new UnstructuredClient({ serverURL });
	}

	/**
	 * Головний метод для обробки завантаженого PDF мануалу
	 */
	async processAndStoreManual(file: Express.Multer.File, carModel: string) {
		this.logger.log(
			`Починаємо AI-парсинг мануалу для: ${carModel} через Unstructured...`,
		);

		try {
			// 1. Відправляємо PDF у наш Docker-контейнер з моделями YOLO та OCR
			const response = await this.unstructuredClient.general.partition({
				partitionParameters: {
					files: {
						content: file.buffer,
						fileName: file.originalname,
					},
					strategy: 'hi_res' as any, // Найвища якість розпізнавання (вмикає Vision-моделі)
					pdfInferTableStructure: true, // Розпізнавати таблиці як HTML
					extractImageBlockTypes: ['Image'], // Що саме вирізати як картинки
					// chunkingStrategy: 'by_title', // Розумна розбивка (автоматично групує текст під заголовками)
					// maxCharacters: 1000, // Максимальний розмір одного шматка
				},
			});

			// Обходимо проблему з типами автозгенерованого SDK
			const rawResponse: any = response;
			// В залежності від версії SDK, дані можуть бути або в .elements, або прямо в масиві
			const elements =
				rawResponse?.elements ||
				(Array.isArray(rawResponse) ? rawResponse : []);

			this.logger.log(
				`Unstructured повернув ${elements.length} інтелектуальних блоків. Обробляємо...`,
			);

			const langchainDocs: Document[] = [];

			// 2. Ітеруємося по всіх знайдених елементах (Текст, Таблиці, Картинки)
			for (const element of elements) {
				// Базові метадані, які будуть у кожному векторі
				const metadata: Record<string, any> = {
					carModel,
					source: file.originalname,
					pageNumber: element.metadata?.page_number,
					type: element.type, // 'CompositeElement', 'Table' або 'Image'
				};

				let pageContent = element.text || '';

				// --- ОБРОБКА ТАБЛИЦЬ ---
				if (element.type === 'Table' && element.metadata?.text_as_html) {
					// Зберігаємо оригінальну HTML-таблицю в метадані (щоб потім віддати її LLM)
					metadata.html = element.metadata.text_as_html;
					// Для вектора залишаємо звичайний текст таблиці, щоб його можна було знайти
					pageContent = `Таблиця з мануалу ${carModel}:\n${element.text}`;
				}

				// --- МУЛЬТИМОДАЛЬНА МАГІЯ (ОБРОБКА КАРТИНОК) ---
				if (element.type === 'Image' && element.metadata?.image_base64) {
					this.logger.log(
						`Знайдено схему на сторінці ${metadata.pageNumber}. Завантажуємо в S3...`,
					);

					// 1. Перетворюємо Base64 (який повернув Unstructured) назад у файл
					const imageBuffer = Buffer.from(
						element.metadata.image_base64,
						'base64',
					);
					const s3File = {
						buffer: imageBuffer,
						originalname: `${carModel.replace(/\s+/g, '_')}_page_${metadata.pageNumber}_${uuidv4().slice(0, 6)}.png`,
						mimetype: 'image/png',
					} as Express.Multer.File;

					// 2. Завантажуємо у твій справжній AWS S3
					const uploadRes = await this.dmsService.uploadSingleFile({
						file: s3File,
						isPublic: true,
					});

					// 3. Зберігаємо лінк на S3 в метадані вектора!
					metadata.imageUrl = uploadRes.url;

					// 4. Текст для пошуку цієї картинки (В ідеалі тут має бути саммарі від Vision моделі,
					// але поки залишаємо текст, який Unstructured знайшов поруч із картинкою)
					pageContent = `Зображення/Схема з мануалу ${carModel}. Контекст: ${element.text}`;
				}

				// 3. Створюємо фінальний документ LangChain
				// Додаємо його в масив тільки якщо є хоч якийсь текст для створення вектора
				if (pageContent.trim().length > 0) {
					langchainDocs.push(
						new Document({
							pageContent,
							metadata,
						}),
					);
				}
			}

			// 4. Зберігаємо всі вектори в Qdrant через твій новий гібридний стор!
			this.logger.log(
				`Генеруємо вектори для ${langchainDocs.length} блоків і зберігаємо в Qdrant...`,
			);
			await this.qdrantService.vectorStore.addDocuments(langchainDocs);

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
					}),
				},
			});

			this.logger.log(
				`Мануал ${carModel} успішно оброблено, картинки в S3, вектори в Qdrant!`,
			);
			return {
				success: true,
				chunksProcessed: langchainDocs.length,
				manual: {
					id: manualRecord.id,
					filename: manualRecord.filename,
					carModel,
					createdAt: manualRecord.createdAt,
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

	private encodeManualExternalMetadata(metadata: {
		s3Key: string;
		carModel: string;
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
			};
		}

		try {
			const parsed = JSON.parse(externalId);
			if (parsed && typeof parsed === 'object') {
				return {
					s3Key: typeof parsed.s3Key === 'string' ? parsed.s3Key : null,
					carModel: typeof parsed.carModel === 'string' ? parsed.carModel : null,
				};
			}
		} catch {
			// Backward compatibility: in legacy records externalId may contain only an S3 key.
		}

		return {
			s3Key: externalId.toLowerCase().includes('.pdf') ? externalId : null,
			carModel: null,
		};
	}
}
