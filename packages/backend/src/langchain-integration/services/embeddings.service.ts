import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingsService {
	private readonly model: string = 'text-embedding-3-small';
	embeddings: OpenAIEmbeddings;
	constructor() {
		this.embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY,
			model: this.model,
		});
	}

	async getEmbedding(text: string): Promise<number[]> {
		const embedding = await this.embeddings.embedQuery(text);
		return embedding;
	}
}
