import { BaseMessageLike } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantService } from 'src/langchain-integration/services/qdrant.service';
import { AgentState } from '../../state';
import { systemPrompt } from './prompts/rag-node-system.prompt';
import { createSearchManualsTool } from './tools/search-manuals.tool';

@Injectable()
export class RagNodeService {
	private model = '';
	private llm: ChatOpenAI;

	constructor(
		private readonly configService: ConfigService,
		private readonly qdrantService: QdrantService,
	) {
		this.model = this.configService.get('OPENAI_MODEL') || 'gpt-5-mini';
		this.llm = new ChatOpenAI({
			modelName: this.model,
		});
	}

	async process(state: typeof AgentState.State) {
		const searchTool = createSearchManualsTool(this.qdrantService);
		const llmWithTools = this.llm.bindTools([searchTool]);

		const input: BaseMessageLike[] = [
			{ role: 'system', content: systemPrompt },
			...state.messages,
		];

		const response = await llmWithTools.invoke(input);
		const toolCalls = response.tool_calls || [];
		let toolMessages: BaseMessageLike[] = [];
		for (const tool_call of toolCalls) {
			if (tool_call.name === 'search_manuals') {
				const toolResponse = await searchTool.invoke(tool_call);
				toolMessages.push({
					role: 'tool',
					content: toolResponse.content,
					tool_call_id: tool_call.id,
				});
			}
		}
		const finalResponse = await this.llm.invoke([
			...input,
			response,
			...toolMessages,
		]);
		return {
			messages: [response, ...toolMessages, finalResponse],
			next: 'supervisor',
		};
	}
}
