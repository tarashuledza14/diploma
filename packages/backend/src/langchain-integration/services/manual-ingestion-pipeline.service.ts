import { Document } from '@langchain/core/documents';
import { BaseStore } from '@langchain/core/stores';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ManualOriginalDocstoreService } from './manual-original-docstore.service';
import { QdrantService } from './qdrant.service';

interface IndexManualChunksParams {
	chunks: Document[];
	vectorRef: string;
	carModel: string;
	organizationId: string;
	source: string;
}

interface IndexManualChunksResult {
	indexedChunks: number;
	skippedChunks: number;
}

interface PreparedChunk {
	docId: string;
	originalDocument: Document;
}

@Injectable()
export class ManualIngestionPipelineService {
	private readonly logger = new Logger(ManualIngestionPipelineService.name);
	private readonly summaryModel: ChatOpenAI;
	private readonly docstore: BaseStore<string, Document>;
	private readonly idKey = 'doc_id';
	private readonly summaryFallbackLength = 600;
	private readonly maxSummaryInputLength = 3200;
	private readonly maxCarModelLength = 120;
	private readonly defaultSummaryConcurrency = 6;
	private readonly maxSummaryConcurrency = 16;
	private readonly vectorBatchSize = 128;

	constructor(
		private readonly configService: ConfigService,
		private readonly qdrantService: QdrantService,
		private readonly manualOriginalDocstoreService: ManualOriginalDocstoreService,
	) {
		this.summaryModel = new ChatOpenAI({
			modelName:
				this.configService.get<string>('RAG_SUMMARY_MODEL') || 'gpt-4o-mini',
			temperature: 0,
		});
		this.docstore = this.manualOriginalDocstoreService;
	}

	getDocstore() {
		return this.docstore;
	}

	getIdKey() {
		return this.idKey;
	}

	async indexManualChunks(
		params: IndexManualChunksParams,
	): Promise<IndexManualChunksResult> {
		const debugLogsOnly = this.isFlagEnabled('RAG_DEBUG_LOGS_ONLY');

		if (params.chunks.length === 0) {
			return {
				indexedChunks: 0,
				skippedChunks: 0,
			};
		}

		if (!debugLogsOnly && !this.qdrantService.vectorStore) {
			throw new Error('Qdrant vector store is not initialized.');
		}

		const originalDocsForStore: Array<[string, Document]> = [];
		const summaryDocsForVectorStore: Document[] = [];
		let skippedChunks = 0;
		const preparedChunks: PreparedChunk[] = [];

		for (const chunk of params.chunks) {
			const normalizedOriginalChunk = this.normalizeOriginalChunk({
				chunk,
				vectorRef: params.vectorRef,
				carModel: params.carModel,
				organizationId: params.organizationId,
				source: params.source,
			});

			if (!normalizedOriginalChunk.pageContent) {
				skippedChunks += 1;
				continue;
			}

			const docId = this.createDocId(params.vectorRef);
			const originalMetadata = {
				...(normalizedOriginalChunk.metadata as Record<string, unknown>),
				[this.idKey]: docId,
			};

			const originalDocument = new Document({
				pageContent: normalizedOriginalChunk.pageContent,
				metadata: originalMetadata,
			});

			preparedChunks.push({
				docId,
				originalDocument,
			});
		}

		const summaryConcurrency = this.resolveSummaryConcurrency();
		this.logger.log(
			`Generating retrieval summaries concurrently: chunks=${preparedChunks.length}, concurrency=${summaryConcurrency}.`,
		);

		const preparedWithSummary = await this.mapWithConcurrency(
			preparedChunks,
			summaryConcurrency,
			async preparedChunk => {
				const summaryText = await this.summarizeChunkForRetrieval(
					preparedChunk.originalDocument.pageContent,
					params.carModel,
				);

				if (!summaryText) {
					return null;
				}

				const originalMetadata = preparedChunk.originalDocument
					.metadata as Record<string, unknown>;

				return {
					...preparedChunk,
					summaryDocument: new Document({
						pageContent: summaryText,
						metadata: {
							...originalMetadata,
							isSummary: true,
							summaryModel: this.summaryModel.model,
						},
					}),
				};
			},
		);

		for (const item of preparedWithSummary) {
			if (!item) {
				skippedChunks += 1;
				continue;
			}

			originalDocsForStore.push([item.docId, item.originalDocument]);
			summaryDocsForVectorStore.push(item.summaryDocument);
		}

		if (
			originalDocsForStore.length === 0 ||
			summaryDocsForVectorStore.length === 0
		) {
			return {
				indexedChunks: 0,
				skippedChunks: params.chunks.length,
			};
		}

		if (debugLogsOnly) {
			this.logDebugSummaryPreview({
				originalDocsForStore,
				summaryDocsForVectorStore,
			});

			this.logger.warn(
				`[DEBUG] Logs-only mode: skipped writes to docstore and Qdrant for ${summaryDocsForVectorStore.length} prepared vectors.`,
			);

			return {
				indexedChunks: summaryDocsForVectorStore.length,
				skippedChunks,
			};
		}

		/**
		 * Linkage contract:
		 * - docstore keeps ORIGINAL full chunk by doc_id
		 * - vector store keeps SUMMARY with the same metadata.doc_id
		 * MultiVectorRetriever later resolves summary hits -> doc_id -> original chunk.
		 */
		await this.docstore.mset(originalDocsForStore);

		for (
			let i = 0;
			i < summaryDocsForVectorStore.length;
			i += this.vectorBatchSize
		) {
			const batch = summaryDocsForVectorStore.slice(
				i,
				i + this.vectorBatchSize,
			);
			await this.qdrantService.vectorStore.addDocuments(batch);
		}

		this.logger.log(
			`Indexed ${summaryDocsForVectorStore.length} summary vectors and stored ${originalDocsForStore.length} originals in docstore.`,
		);

		return {
			indexedChunks: summaryDocsForVectorStore.length,
			skippedChunks,
		};
	}

	async deleteManualOriginals(vectorRef: string | null) {
		if (!vectorRef) {
			return;
		}

		const deletedCount =
			await this.manualOriginalDocstoreService.deleteByVectorRef(vectorRef);

		if (deletedCount === 0) {
			return;
		}

		this.logger.log(
			`Removed ${deletedCount} original chunks from docstore for vectorRef ${vectorRef}.`,
		);
	}

	private async summarizeChunkForRetrieval(
		chunk: string,
		carModel: string,
	): Promise<string> {
		const normalizedChunk = this.sanitizeText(chunk).slice(
			0,
			this.maxSummaryInputLength,
		);
		if (!normalizedChunk) {
			return '';
		}

		if (this.shouldKeepChunkAsSummary(normalizedChunk)) {
			return normalizedChunk;
		}

		const normalizedCarModel = this.sanitizeText(carModel).slice(
			0,
			this.maxCarModelLength,
		);

		try {
			const response = await this.summaryModel.invoke([
				{
					role: 'system',
					content:
						'You create short retrieval-optimized summaries for vector search. Use only facts explicitly present in the chunk. Do not add assumptions, defaults, background knowledge, or inferred numeric values. Keep key parts, values, units, and procedural terms. If the chunk is already short and clear, keep wording very close to the original. Return plain text in Ukrainian.',
				},
				{
					role: 'user',
					content: `Car model context: ${normalizedCarModel}\n\nChunk:\n${normalizedChunk}`,
				},
			]);

			const summary = this.sanitizeText(
				this.readMessageContent(response.content),
			);
			if (summary) {
				return this.applySummarySafetyGuards(normalizedChunk, summary);
			}
		} catch (error) {
			this.logger.warn(
				`Summary generation failed for one chunk, using fallback text: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		return normalizedChunk.slice(0, this.summaryFallbackLength);
	}

	private shouldKeepChunkAsSummary(chunk: string) {
		const wordCount = this.getWordCount(chunk);
		return wordCount <= 5 || chunk.length <= 48;
	}

	private applySummarySafetyGuards(sourceChunk: string, summary: string) {
		if (this.containsDigit(summary) && !this.containsDigit(sourceChunk)) {
			return sourceChunk;
		}

		const sourceWords = this.getWordCount(sourceChunk);
		const summaryWords = this.getWordCount(summary);
		if (sourceWords <= 12 && summaryWords > sourceWords * 3) {
			return sourceChunk;
		}

		return summary;
	}

	private containsDigit(value: string) {
		return /\d/.test(value);
	}

	private getWordCount(value: string) {
		if (!value) {
			return 0;
		}

		return value.split(/\s+/).filter(Boolean).length;
	}

	private readMessageContent(content: unknown): string {
		if (typeof content === 'string') {
			return content;
		}

		if (!Array.isArray(content)) {
			return '';
		}

		return content
			.map(part => {
				if (typeof part === 'string') {
					return part;
				}

				if (
					part &&
					typeof part === 'object' &&
					'text' in part &&
					typeof (part as { text?: unknown }).text === 'string'
				) {
					return (part as { text: string }).text;
				}

				return '';
			})
			.join(' ')
			.trim();
	}

	private normalizeOriginalChunk(params: {
		chunk: Document;
		vectorRef: string;
		carModel: string;
		organizationId: string;
		source: string;
	}) {
		const metadata = {
			...(params.chunk.metadata as Record<string, unknown>),
			vectorRef: params.vectorRef,
			carModel: params.carModel,
			organizationId: params.organizationId,
			source: params.source,
		};

		return new Document({
			pageContent: this.sanitizeText(params.chunk.pageContent),
			metadata,
		});
	}

	private createDocId(vectorRef: string) {
		return `${this.getManualDocPrefix(vectorRef)}${uuidv4()}`;
	}

	private getManualDocPrefix(vectorRef: string) {
		return `manual:${vectorRef}:`;
	}

	private sanitizeText(value: string) {
		if (!value) {
			return '';
		}

		const withoutInvalidUnicode = this.stripInvalidUnicode(value);

		return withoutInvalidUnicode
			.replace(/\u0000/g, ' ')
			.replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
			.replace(/[\u2028\u2029]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private stripInvalidUnicode(value: string) {
		const chunks: string[] = [];

		for (let i = 0; i < value.length; i += 1) {
			const code = value.charCodeAt(i);

			if (code >= 0xd800 && code <= 0xdbff) {
				const next = value.charCodeAt(i + 1);
				if (next >= 0xdc00 && next <= 0xdfff) {
					chunks.push(value[i], value[i + 1]);
					i += 1;
				}

				continue;
			}

			if (code >= 0xdc00 && code <= 0xdfff) {
				continue;
			}

			chunks.push(value[i]);
		}

		return chunks.join('');
	}

	private resolveSummaryConcurrency() {
		const rawValue = Number(
			this.configService.get<string>('RAG_SUMMARY_CONCURRENCY') ||
				this.defaultSummaryConcurrency,
		);

		if (!Number.isFinite(rawValue) || rawValue <= 0) {
			return this.defaultSummaryConcurrency;
		}

		return Math.min(Math.floor(rawValue), this.maxSummaryConcurrency);
	}

	private isFlagEnabled(name: string) {
		const value = (this.configService.get<string>(name) || '')
			.trim()
			.toLowerCase();
		return (
			value === '1' || value === 'true' || value === 'yes' || value === 'on'
		);
	}

	private logDebugSummaryPreview(params: {
		originalDocsForStore: Array<[string, Document]>;
		summaryDocsForVectorStore: Document[];
	}) {
		const previewCount = Math.min(
			this.resolveDebugPreviewLimit(),
			params.summaryDocsForVectorStore.length,
		);
		this.logger.log(
			`[DEBUG] Summary preview (showing ${previewCount} of ${params.summaryDocsForVectorStore.length}).`,
		);

		for (let i = 0; i < previewCount; i += 1) {
			const [docId, originalDoc] = params.originalDocsForStore[i];
			const summaryDoc = params.summaryDocsForVectorStore[i];
			const payloadPreview = {
				pageContent: summaryDoc.pageContent,
				metadata: summaryDoc.metadata,
			};

			this.logger.log(
				`[DEBUG][DOC ${i + 1}] doc_id=${docId} original="${originalDoc.pageContent.slice(0, 400)}"`,
			);
			this.logger.log(
				`[DEBUG][SUMMARY ${i + 1}] "${summaryDoc.pageContent.slice(0, 400)}"`,
			);
			this.logger.log(
				`[DEBUG][QDRANT PAYLOAD ${i + 1}] ${JSON.stringify(payloadPreview).slice(0, 1500)}`,
			);
		}
	}

	private resolveDebugPreviewLimit() {
		const rawValue = Number(
			this.configService.get<string>('RAG_DEBUG_PREVIEW_LIMIT') || 3,
		);

		if (!Number.isFinite(rawValue) || rawValue <= 0) {
			return 3;
		}

		return Math.min(Math.floor(rawValue), 100);
	}

	private async mapWithConcurrency<TInput, TOutput>(
		items: TInput[],
		concurrency: number,
		worker: (item: TInput, index: number) => Promise<TOutput>,
	) {
		if (items.length === 0) {
			return [] as TOutput[];
		}

		const maxWorkers = Math.max(1, Math.min(concurrency, items.length));
		const results = new Array<TOutput>(items.length);
		let cursor = 0;

		const runWorker = async () => {
			while (true) {
				const currentIndex = cursor;
				cursor += 1;

				if (currentIndex >= items.length) {
					return;
				}

				results[currentIndex] = await worker(items[currentIndex], currentIndex);
			}
		};

		await Promise.all(Array.from({ length: maxWorkers }, () => runWorker()));

		return results;
	}
}
