import { AIMessage } from '@langchain/core/messages';
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import z from 'zod';
import { AgentState } from '../state';
import { buildSupervisorSystemPrompt } from './prompts/supervisor.prompt';

const elevatedRouteSchema = z.object({
	next: z.enum(['rag_node', 'db_node', '__end__']),
	reasoning: z.string(),
	finalMessage: z.string(),
});

const mechanicRouteSchema = z.object({
	next: z.enum(['rag_node', '__end__']),
	reasoning: z.string(),
	finalMessage: z.string(),
});

const supervisorPrompt = ChatPromptTemplate.fromMessages([
	['system', '{systemPrompt}'],
	new MessagesPlaceholder('messages'),
]);

@Injectable()
export class SupervisorNodeService {
	private readonly llm: ChatOpenAI;

	constructor(private configService: ConfigService) {
		this.llm = new ChatOpenAI({
			modelName: this.configService.get('OPENAI_MODEL') || 'gpt-5-mini',
		});
	}

	async process(state: typeof AgentState.State) {
		const normalizedRole = (state.userRole ?? 'MECHANIC').toUpperCase();
		const isElevatedRole =
			normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';
		const systemPrompt = buildSupervisorSystemPrompt(normalizedRole);

		if (!isElevatedRole) {
			const supervisor = this.llm.withStructuredOutput(mechanicRouteSchema);
			const prompt = await supervisorPrompt.formatMessages({
				systemPrompt,
				messages: state.messages,
			});
			const response = await supervisor.invoke(prompt);

			if (response.next === '__end__') {
				const deniedMessage =
					response.finalMessage?.trim() ||
					'Вибачте, у вас немає доступу до внутрішніх бізнес-даних (замовлення, клієнти, ціни, склад). Я можу допомогти з технічними інструкціями та посібниками.';

				return {
					next: '__end__',
					messages: [new AIMessage(deniedMessage)],
				};
			}

			return {
				next: response.next,
			};
		}

		const supervisor = this.llm.withStructuredOutput(elevatedRouteSchema);
		const prompt = await supervisorPrompt.formatMessages({
			systemPrompt,
			messages: state.messages,
		});
		const response = await supervisor.invoke(prompt);

		if (response.next === '__end__') {
			const finalMessage = response.finalMessage?.trim();
			if (finalMessage) {
				return {
					next: '__end__',
					messages: [new AIMessage(finalMessage)],
				};
			}
		}

		return {
			next: response.next,
		};
	}
}
