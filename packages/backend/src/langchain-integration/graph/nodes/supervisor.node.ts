import { AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import z from 'zod';
import { AgentState } from '../state';
import { buildSupervisorSystemPrompt } from './prompts/supervisor.prompt';

const elevatedRouteSchema = z.object({
	next: z.enum(['rag_node', 'db_node', '__end__']).describe(
		`Determine the next step in the workflow:
		 - 'rag_node': Choose if the question concerns technical specifications, diagrams, torque values, or VW Passat B8 repair procedures.
		 - 'db_node': Choose if the question requires querying the database.
		 - '__end__': Choose ONLY when the answer is already fully formed by the specialist and requires no additional clarification.`,
	),
	reasoning: z
		.string()
		.describe(
			'Brief justification for why this node was selected (for internal logging)',
		),
});

const mechanicRouteSchema = z.object({
	next: z.enum(['rag_node', '__end__']).describe(
		`Determine the next step in the workflow:
		 - 'rag_node': Choose if the question concerns technical specifications, diagrams, torque values, or VW Passat B8 repair procedures.
		 - '__end__': Choose when the user requests database/business data that MECHANIC role cannot access, and provide a polite denial in finalMessage.`,
	),
	reasoning: z
		.string()
		.describe(
			'Brief justification for why this node was selected (for internal logging)',
		),
	finalMessage: z
		.string()
		.describe(
			"Final user-facing message. If next is '__end__', provide a polite denial. If next is 'rag_node', return an empty string.",
		),
});

@Injectable()
export class SupervisorNodeService {
	private readonly llm: ChatOpenAI;

	constructor(private configService: ConfigService) {
		this.llm = new ChatOpenAI({
			modelName: 'gpt-5-mini', // Тут краще брати розумну модель
			// temperature: 0.1, // Щоб рішення були чіткими
		});
	}

	async process(state: typeof AgentState.State) {
		const normalizedRole = (state.userRole ?? 'MECHANIC').toUpperCase();
		const isElevatedRole =
			normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';

		if (!isElevatedRole) {
			const supervisor = this.llm.withStructuredOutput(mechanicRouteSchema);
			const response = await supervisor.invoke([
				{
					role: 'system',
					content: buildSupervisorSystemPrompt(normalizedRole),
				},
				...state.messages,
			]);

			if (response.next === '__end__') {
				const deniedMessage =
					response.finalMessage?.trim() ||
					'Вибачте, у вас немає доступу до внутрішніх бізнес-даних (замовлення, клієнти, ціни, склад). Я можу допомогти з технічними інструкціями та мануалами.';

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
		const response = await supervisor.invoke([
			{ role: 'system', content: buildSupervisorSystemPrompt(normalizedRole) },
			...state.messages,
		]);

		return {
			next: response.next,
		};
	}
}
