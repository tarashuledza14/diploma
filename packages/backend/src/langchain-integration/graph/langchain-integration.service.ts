import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage } from 'langchain';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { DbNodeService } from './nodes/db-node/db.node';
import { RagNodeService } from './nodes/rag-node/rag.node';
import { SupervisorNodeService } from './nodes/supervisor.node';
import { AgentState } from './state';

function getChunkText(msg: any): string {
	const content = msg?.content;

	if (typeof content === 'string') {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map(part => {
				if (typeof part === 'string') return part;
				if (part && typeof part === 'object') {
					if (typeof part.text === 'string') return part.text;
					if (part.type === 'text' && typeof part.text === 'string') {
						return part.text;
					}
				}
				return '';
			})
			.join('');
	}

	return '';
}

/** Остання відповідь асистента без проміжних викликів інструментів (для збереження в чат). */
function extractAssistantReplyFromMessages(
	messages: any[] | undefined,
): string {
	if (!messages?.length) {
		return '';
	}

	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		const msgType =
			typeof msg?._getType === 'function' ? msg._getType() : undefined;
		if (msgType !== 'ai') {
			continue;
		}

		const hasToolCalls =
			(msg.tool_calls && msg.tool_calls.length > 0) ||
			(msg.tool_call_chunks && msg.tool_call_chunks.length > 0);
		if (hasToolCalls) {
			continue;
		}

		const text = getChunkText(msg).trim();
		if (!text) {
			continue;
		}
		if (
			text.includes('EXECUTING_SQL_QUERY') ||
			text.includes('Call to tool was made') ||
			text.includes('{"query":')
		) {
			continue;
		}

		return text;
	}

	return '';
}

@Injectable()
export class LangchainIntegrationService {
	private readonly logger = new Logger(LangchainIntegrationService.name);
	private readonly titleModel: ChatOpenAI;

	constructor(
		private readonly db: PrismaService,
		private readonly configService: ConfigService,
		private readonly supervisorService: SupervisorNodeService,
		private readonly ragService: RagNodeService,
		private readonly dbService: DbNodeService,
	) {
		this.titleModel = new ChatOpenAI({
			modelName: this.configService.get('OPENAI_TITLE_MODEL') || 'gpt-4o-mini',
			temperature: 0,
		});
	}

	async generateChatTitle(
		chatId: string,
		firstUserMsg: string,
		firstAiResponse: string,
	): Promise<void> {
		const prompt = `Summarize this technical support exchange into a 3-5 word title in the user's language. Focus on the car model and the specific technical issue. Output ONLY the title text. No quotes.
User: ${firstUserMsg}
Assistant: ${firstAiResponse}`;

		const result = await this.titleModel.invoke(prompt);
		const rawTitle = getChunkText(result).replace(/\s+/g, ' ').trim();

		if (!rawTitle) {
			return;
		}

		const safeTitle = rawTitle.slice(0, 100);

		await this.db.chatSession.update({
			where: { id: chatId },
			data: { title: safeTitle },
		});
	}

	async createChatSession(userId: string, title?: string) {
		const safeTitle = title?.trim() || 'New chat';
		return this.db.chatSession.create({
			data: { title: safeTitle, userId },
			select: { id: true, title: true, createdAt: true, updatedAt: true },
		});
	}

	async getChatSessions(userId: string) {
		const sessions = await this.db.chatSession.findMany({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			include: {
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: { content: true, role: true, createdAt: true },
				},
			},
		});

		return sessions.map(session => ({
			id: session.id,
			title: session.title,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastMessage: session.messages[0] ?? null,
		}));
	}

	async getChatMessages(chatId: string, userId: string) {
		const chat = await this.db.chatSession.findFirst({
			where: { id: chatId, userId },
			select: { id: true },
		});

		if (!chat) {
			throw new NotFoundException('Chat session not found');
		}

		return this.db.chatMessage.findMany({
			where: { chatId },
			orderBy: { createdAt: 'asc' },
			select: { id: true, role: true, content: true, createdAt: true },
		});
	}

	async deleteChatSession(chatId: string, userId: string) {
		const deleted = await this.db.chatSession.deleteMany({
			where: { id: chatId, userId },
		});

		if (deleted.count === 0) {
			throw new NotFoundException('Chat session not found');
		}

		return { success: true };
	}

	async process(chatId: string, userMessage: string, userId: string) {
		if (!chatId?.trim()) {
			throw new BadRequestException('chatId is required');
		}

		const normalizedUserMessage = userMessage?.trim();

		if (!normalizedUserMessage) {
			throw new BadRequestException('message is required');
		}

		if (!userId?.trim()) {
			throw new UnauthorizedException('User context is required');
		}

		const currentUser = await this.db.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!currentUser) {
			throw new UnauthorizedException('User not found');
		}

		const chat = await this.db.chatSession.findFirst({
			where: { id: chatId, userId },
			select: { id: true },
		});

		if (!chat) {
			throw new NotFoundException('Chat session not found');
		}

		const existingMessagesCount = await this.db.chatMessage.count({
			where: { chatId },
		});
		const isFirstMessageInChat = existingMessagesCount === 0;

		await this.db.chatMessage.create({
			data: {
				chatId,
				role: 'USER',
				content: normalizedUserMessage,
			},
		});

		const workflow = new StateGraph(AgentState)
			.addNode('supervisor', state => this.supervisorService.process(state))
			.addNode('rag_node', state => this.ragService.process(state))
			.addNode('db_node', state => this.dbService.process(state))
			.addEdge(START, 'supervisor')
			.addConditionalEdges('supervisor', state => state.next, {
				rag_node: 'rag_node',
				db_node: 'db_node',
				__end__: '__end__',
			})
			.addEdge('rag_node', END)
			.addEdge('db_node', END);

		return new Observable(subscriber => {
			(async () => {
				try {
					const app = workflow.compile();
					let assistantText = '';

					const initialGraphState = {
						messages: [new HumanMessage(normalizedUserMessage)],
						next: 'supervisor',
						userRole: currentUser.role,
					};

					/**
					 * `streamMode: "messages"` ловить лише токени зовнішнього графа. Узли `db_node` / `rag_node`
					 * всередині викликають LLM через `invoke` / внутрішній агент — ці токени сюди не потрапляють,
					 * тому текст відповіді виходив порожнім. `values` повертає повний стан після кожного кроку,
					 * включно з повідомленнями після завершення db/rag.
					 */
					const stream = await app.stream(initialGraphState, {
						streamMode: 'values',
					});

					subscriber.next({
						data: { type: 'status', message: 'Аналізую запит...' },
					} as MessageEvent);

					for await (const state of stream as AsyncIterable<
						typeof AgentState.State
					>) {
						const reply = extractAssistantReplyFromMessages(state.messages);
						if (!reply || reply.length <= assistantText.length) {
							continue;
						}
						const delta = reply.slice(assistantText.length);
						assistantText = reply;
						subscriber.next({
							data: { type: 'text_chunk', text: delta },
						} as MessageEvent);
					}

					if (!assistantText.trim()) {
						this.logger.warn(
							`Empty assistant reply after graph run for chat ${chatId}.`,
						);
					}

					await this.db.chatMessage.create({
						data: {
							chatId,
							role: 'ASSISTANT',
							content: assistantText || 'No response from assistant.',
						},
					});

					if (isFirstMessageInChat) {
						void this.generateChatTitle(
							chatId,
							normalizedUserMessage,
							assistantText || 'No response from assistant.',
						).catch(error => {
							this.logger.warn(
								`Unable to generate title for chat ${chatId}: ${error instanceof Error ? error.message : String(error)}`,
							);
						});
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
