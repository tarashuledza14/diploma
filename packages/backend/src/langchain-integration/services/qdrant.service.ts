import { QdrantVectorStore } from '@langchain/qdrant';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class QdrantService implements OnModuleInit {
	private readonly logger = new Logger(QdrantService.name);
	private readonly collectionName = 'car_manuals';
	private client: QdrantClient;

	// Робимо public, щоб наш RAG-агент міг дістати цей стор для пошуку
	public vectorStore: QdrantVectorStore;

	constructor(
		private readonly embeddingsService: EmbeddingsService,
		private readonly configService: ConfigService,
	) {}

	async onModuleInit() {
		const qdrantUrl =
			this.configService.get<string>('QDRANT_URL') || 'http://localhost:6333';
		this.client = new QdrantClient({ url: qdrantUrl });

		try {
			// КРОК 1: Нативний клієнт для перевірки/створення бази
			const response = await this.client.getCollections();
			const exists = response.collections.some(
				c => c.name === this.collectionName,
			);

			if (!exists) {
				this.logger.log(
					`Створюю нову колекцію векторів: ${this.collectionName}`,
				);
				await this.client.createCollection(this.collectionName, {
					vectors: {
						size: 1536, // Розмір вектора OpenAI
						distance: 'Cosine',
					},
				});
			}

			// КРОК 2: Твоя LangChain обгортка! Тепер вона підключиться безпечно.
			this.vectorStore = await QdrantVectorStore.fromExistingCollection(
				this.embeddingsService.embeddings, // Твій сервіс з OpenAI Embeddings
				{
					url: qdrantUrl,
					collectionName: this.collectionName,
				},
			);

			this.logger.log('QdrantVectorStore (LangChain) успішно ініціалізовано!');
		} catch (error) {
			this.logger.error('Помилка ініціалізації Qdrant', error);
		}
	}

	async deleteManualVectors(params: {
		vectorRef: string | null;
		filename: string;
		carModel: string | null;
	}) {
		if (!this.client) {
			this.logger.warn(
				'Qdrant client is not initialized; skip vector cleanup.',
			);
			return;
		}

		const mustFilters: Array<Record<string, unknown>> = [];

		if (params.vectorRef) {
			mustFilters.push({
				key: 'metadata.vectorRef',
				match: { value: params.vectorRef },
			});
		} else {
			mustFilters.push({
				key: 'metadata.source',
				match: { value: params.filename },
			});

			if (params.carModel) {
				mustFilters.push({
					key: 'metadata.carModel',
					match: { value: params.carModel },
				});
			}
		}

		if (!mustFilters.length) {
			return;
		}

		try {
			await this.client.delete(this.collectionName, {
				wait: true,
				filter: {
					must: mustFilters,
				},
			} as any);
		} catch (error) {
			this.logger.warn(
				`Failed to delete vectors for manual ${params.filename}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
