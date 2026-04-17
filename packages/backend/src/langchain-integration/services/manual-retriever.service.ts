import { MultiVectorRetriever } from '@langchain/classic/retrievers/multi_vector';
import { Document } from '@langchain/core/documents';
import { VectorStoreInterface } from '@langchain/core/vectorstores';
import { Injectable, Logger } from '@nestjs/common';
import { DmsService } from 'src/dms/dms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManualIngestionPipelineService } from './manual-ingestion-pipeline.service';
import { QdrantService } from './qdrant.service';

interface SearchManualsParams {
	query: string;
	carModel?: string;
	organizationId: string;
	k?: number;
}

interface ManualExternalMetadata {
	s3Key: string | null;
}

@Injectable()
export class ManualRetrieverService {
	private readonly logger = new Logger(ManualRetrieverService.name);

	constructor(
		private readonly qdrantService: QdrantService,
		private readonly ingestionPipelineService: ManualIngestionPipelineService,
		private readonly dmsService: DmsService,
		private readonly prismaService: PrismaService,
	) {}

	async searchManuals(params: SearchManualsParams): Promise<Document[]> {
		if (!this.qdrantService.vectorStore) {
			this.logger.warn('Qdrant vector store is not initialized.');
			return [];
		}

		const topK = params.k ?? 6;
		const tenantScopedFilter = {
			must: [
				{
					key: 'metadata.organizationId',
					match: { value: params.organizationId },
				},
			],
		};
		const normalizedCarModel = params.carModel?.trim() || '';

		let documents = await this.searchWithMultiVector({
			query: params.query,
			filter: normalizedCarModel
				? {
						...tenantScopedFilter,
						should: [
							{
								key: 'metadata.carModel',
								match: { value: normalizedCarModel },
							},
						],
					}
				: tenantScopedFilter,
			topK,
		});

		if (documents.length === 0 && normalizedCarModel) {
			documents = await this.searchWithMultiVector({
				query: `${params.query} ${normalizedCarModel}`,
				filter: tenantScopedFilter,
				topK,
			});

			const normalizedCarModelLower = normalizedCarModel.toLowerCase();
			const strictModelMatches = documents.filter(doc => {
				const model = String(doc.metadata?.carModel ?? '').toLowerCase();
				return model.includes(normalizedCarModelLower);
			});
			if (strictModelMatches.length > 0) {
				documents = strictModelMatches;
			}
		}

		const limitedDocuments = documents.slice(0, topK);
		this.logSearchDebugSnapshot(
			params.query,
			normalizedCarModel,
			limitedDocuments,
		);

		return limitedDocuments;
	}

	async resolveManualImageUrl(metadata: Record<string, unknown>) {
		const candidateKeys = [
			typeof metadata.fullPageImageKey === 'string'
				? metadata.fullPageImageKey
				: null,
			typeof metadata.imageKey === 'string' ? metadata.imageKey : null,
			this.extractS3KeyFromUrl(
				typeof metadata.fullPageImageUrl === 'string'
					? metadata.fullPageImageUrl
					: typeof metadata.imageUrl === 'string'
						? metadata.imageUrl
						: '',
			),
		].filter((item): item is string => Boolean(item?.trim()));

		for (const key of candidateKeys) {
			try {
				const presigned = await this.dmsService.getPresignedSignedUrl(key);
				if (presigned?.url) {
					return presigned.url;
				}
			} catch {
				// Ignore and fallback to the next candidate.
			}
		}

		if (typeof metadata.fullPageImageUrl === 'string') {
			return metadata.fullPageImageUrl;
		}

		if (typeof metadata.imageUrl === 'string') {
			return metadata.imageUrl;
		}

		return null;
	}

	async resolveManualPdfUrl(
		metadata: Record<string, unknown>,
		organizationId: string,
	) {
		const directUrl =
			typeof metadata.manualPdfUrl === 'string' ? metadata.manualPdfUrl : null;
		if (directUrl?.trim()) {
			return directUrl;
		}

		const keyCandidates = [
			typeof metadata.manualPdfKey === 'string' ? metadata.manualPdfKey : null,
			typeof metadata.sourcePdfKey === 'string' ? metadata.sourcePdfKey : null,
			typeof metadata.pdfKey === 'string' ? metadata.pdfKey : null,
		].filter((item): item is string => Boolean(item?.trim()));

		for (const key of keyCandidates) {
			try {
				const presigned = await this.dmsService.getPresignedSignedUrl(key);
				if (presigned?.url) {
					return presigned.url;
				}
			} catch {
				// Ignore and fallback to the next candidate.
			}
		}

		const vectorRef =
			typeof metadata.vectorRef === 'string' ? metadata.vectorRef.trim() : '';
		if (!vectorRef) {
			return null;
		}

		const escapedVectorRef = vectorRef.replace(/"/g, '');
		const manualRecord = await this.prismaService.document.findFirst({
			where: {
				organizationId,
				externalId: {
					contains: `"vectorRef":"${escapedVectorRef}"`,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				externalId: true,
			},
		});

		const manualExternalMetadata = this.parseManualExternalMetadata(
			manualRecord?.externalId ?? null,
		);
		if (!manualExternalMetadata.s3Key) {
			return null;
		}

		const { url } = await this.dmsService.getPresignedSignedUrl(
			manualExternalMetadata.s3Key,
		);

		return url || null;
	}

	private async searchWithMultiVector(params: {
		query: string;
		filter?: Record<string, unknown>;
		topK: number;
	}) {
		const retriever = new MultiVectorRetriever({
			vectorstore: this.createScopedVectorStore(params.filter),
			docstore: this.ingestionPipelineService.getDocstore(),
			idKey: this.ingestionPipelineService.getIdKey(),
			childK: Math.max(params.topK * 3, 12),
			parentK: params.topK,
		});

		return retriever.invoke(params.query);
	}

	private createScopedVectorStore(filter?: Record<string, unknown>) {
		const baseVectorStore = this.qdrantService.vectorStore;

		return {
			similaritySearch: (query: string, k?: number, _runtimeFilter?: unknown) =>
				baseVectorStore.similaritySearch(query, k, filter),
		} as unknown as VectorStoreInterface;
	}

	private extractS3KeyFromUrl(value: string) {
		if (!value) {
			return null;
		}

		try {
			const parsed = new URL(value);
			const key = parsed.pathname.replace(/^\/+/, '');
			return key || null;
		} catch {
			return null;
		}
	}

	private parseManualExternalMetadata(
		externalId: string | null,
	): ManualExternalMetadata {
		if (!externalId) {
			return {
				s3Key: null,
			};
		}

		try {
			const parsed = JSON.parse(externalId);
			if (parsed && typeof parsed === 'object') {
				return {
					s3Key: typeof parsed.s3Key === 'string' ? parsed.s3Key : null,
				};
			}
		} catch {
			// Backward compatibility: in legacy records externalId may contain only an S3 key.
		}

		return {
			s3Key: externalId.toLowerCase().includes('.pdf') ? externalId : null,
		};
	}

	private logSearchDebugSnapshot(
		query: string,
		carModel: string,
		documents: Document[],
	) {
		const printableCarModel = carModel || '-';
		this.logger.log(
			`Qdrant retrieval: query="${query}", carModel="${printableCarModel}", hits=${documents.length}`,
		);

		documents.slice(0, 12).forEach((doc, index) => {
			const metadata = doc.metadata as Record<string, unknown>;
			const originalPage = metadata.originalPageNumber ?? null;
			const page = metadata.pageNumber ?? null;
			const filteredPage = metadata.filteredPageNumber ?? null;
			const source =
				typeof metadata.source === 'string' ? metadata.source : 'unknown';
			const docId =
				typeof metadata.doc_id === 'string' ? metadata.doc_id : 'unknown';
			const snippet = String(doc.pageContent || '')
				.replace(/\s+/g, ' ')
				.slice(0, 180);

			this.logger.log(
				`Hit #${index + 1}: originalPage=${originalPage}, page=${page}, filteredPage=${filteredPage}, source="${source}", docId="${docId}", snippet="${snippet}"`,
			);
		});
	}
}
