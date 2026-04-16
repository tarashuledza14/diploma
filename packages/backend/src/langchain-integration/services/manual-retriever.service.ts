import { MultiVectorRetriever } from '@langchain/classic/retrievers/multi_vector';
import { Document } from '@langchain/core/documents';
import { VectorStoreInterface } from '@langchain/core/vectorstores';
import { Injectable, Logger } from '@nestjs/common';
import { DmsService } from 'src/dms/dms.service';
import { ManualIngestionPipelineService } from './manual-ingestion-pipeline.service';
import { QdrantService } from './qdrant.service';

interface SearchManualsParams {
	query: string;
	carModel?: string;
	organizationId: string;
	k?: number;
}

@Injectable()
export class ManualRetrieverService {
	private readonly logger = new Logger(ManualRetrieverService.name);

	constructor(
		private readonly qdrantService: QdrantService,
		private readonly ingestionPipelineService: ManualIngestionPipelineService,
		private readonly dmsService: DmsService,
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

		return documents.slice(0, topK);
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
}
