import { START, StateGraph } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { HumanMessage } from 'langchain';
import { Observable } from 'rxjs';
import { RagNodeService } from './nodes/rag-node/rag.node';
import { SupervisorNodeService } from './nodes/supervisor.node';
import { AgentState } from './state';

@Injectable()
export class LangchainIntegrationService {
	constructor(
		private readonly supervisorService: SupervisorNodeService,
		private readonly ragService: RagNodeService,
	) {}

	async process(userMessage: string) {
		const workflow = new StateGraph(AgentState)
			.addNode('supervisor', state => this.supervisorService.process(state))
			.addNode('rag_node', state => this.ragService.process(state))
			.addEdge(START, 'supervisor')
			.addConditionalEdges(
				'supervisor',
				state => state.next, // Функція, яка повертає рядок (назву наступного вузла)
				{
					rag_node: 'rag_node',
					// wiki_node: 'wiki_node',
					__end__: '__end__', // Якщо супервізор каже закінчити — виходимо
				},
			)
			.addEdge('rag_node', 'supervisor');
		return new Observable(subscriber => {
			(async () => {
				try {
					const app = workflow.compile();

					// ЗМІНА ТУТ: Використовуємо streamMode: "messages"
					const stream = await app.stream(
						{
							messages: [new HumanMessage(userMessage)],
							next: 'supervisor',
						},
						{ streamMode: 'messages' },
					);

					// ЗМІНА ТУТ: Деструктуризація кортежу [msg, metadata]
					for await (const [msg, metadata] of stream as any) {
						// 1. Відслідковуємо, хто саме зараз генерує токени
						const currentNode = metadata.langgraph_node;

						// 2. Якщо це RAG і він генерує текст (токени)
						if (currentNode === 'rag_node' && msg.content) {
							// Відправляємо кожен токен на фронт (ефект друкування тексту)
							subscriber.next({
								data: { type: 'text_chunk', text: msg.content },
							} as MessageEvent);
						}

						// 3. Відловлюємо виклик інструменту (щоб показати картинки)
						// Коли LLM викликає searchTool, інформація про картинки зазвичай
						// повертається в ToolMessage, який можна дістати зі стейту або обробити окремо
						if (msg.tool_calls && msg.tool_calls.length > 0) {
							subscriber.next({
								data: { type: 'status', message: 'Шукаю в мануалах Qdrant...' },
							} as MessageEvent);
						}
					}

					subscriber.next({ data: { type: 'done' } } as MessageEvent);
					subscriber.complete();
				} catch (e) {
					subscriber.error(e);
				}
			})();
		});
	}
}
