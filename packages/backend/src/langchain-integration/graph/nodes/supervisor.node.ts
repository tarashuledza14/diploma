import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import z from 'zod';
import { AgentState } from '../state';
import { systemPrompt } from './prompts/supervisor.prompt';

const routeSchema = z.object({
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
		const supervisor = this.llm.withStructuredOutput(routeSchema);

		const response = await supervisor.invoke([
			{ role: 'system', content: systemPrompt },
			...state.messages,
		]);

		return {
			next: response.next,
		};
	}
}
