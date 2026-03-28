import { QdrantVectorStore } from '@langchain/qdrant';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class QdrantService implements OnModuleInit {
	private readonly logger = new Logger(QdrantService.name);

	// Робимо public, щоб наш RAG-агент міг дістати цей стор для пошуку
	public vectorStore: QdrantVectorStore;

	constructor(
		private readonly embeddingsService: EmbeddingsService,
		private readonly configService: ConfigService,
	) {}

	async onModuleInit() {
		const qdrantUrl =
			this.configService.get<string>('QDRANT_URL') || 'http://localhost:6333';
		const collectionName = 'car_manuals';

		try {
			// КРОК 1: Нативний клієнт для перевірки/створення бази
			const client = new QdrantClient({ url: qdrantUrl });
			const response = await client.getCollections();
			const exists = response.collections.some(c => c.name === collectionName);

			if (!exists) {
				this.logger.log(`Створюю нову колекцію векторів: ${collectionName}`);
				await client.createCollection(collectionName, {
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
					collectionName: collectionName,
				},
			);

			this.logger.log('QdrantVectorStore (LangChain) успішно ініціалізовано!');
		} catch (error) {
			this.logger.error('Помилка ініціалізації Qdrant', error);
		}
	}
}
