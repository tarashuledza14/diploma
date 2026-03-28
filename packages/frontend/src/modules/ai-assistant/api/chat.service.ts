import { instance } from '@/api';

import type { AssistantMessage, ChatSessionSummary } from '../types';

type BackendMessageRole = 'USER' | 'ASSISTANT';

interface BackendChatMessage {
	id: string;
	role: BackendMessageRole;
	content: string;
	createdAt: string;
}

interface BackendSessionLastMessage {
	content: string;
	role: BackendMessageRole;
	createdAt: string;
}

interface BackendChatSession {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	lastMessage: BackendSessionLastMessage | null;
}

function toAssistantRole(role: BackendMessageRole): 'user' | 'assistant' {
	return role === 'USER' ? 'user' : 'assistant';
}

function mapMessage(message: BackendChatMessage): AssistantMessage {
	return {
		id: message.id,
		role: toAssistantRole(message.role),
		content: message.content,
		timestamp: new Date(message.createdAt),
	};
}

function mapSession(session: BackendChatSession): ChatSessionSummary {
	return {
		id: session.id,
		title: session.title,
		createdAt: new Date(session.createdAt),
		updatedAt: new Date(session.updatedAt),
		lastMessage: session.lastMessage
			? {
					content: session.lastMessage.content,
					role: toAssistantRole(session.lastMessage.role),
					timestamp: new Date(session.lastMessage.createdAt),
				}
			: null,
	};
}

export class ChatService {
	static async getSessions(): Promise<ChatSessionSummary[]> {
		const response = await instance.get<BackendChatSession[]>('/chat/sessions');
		return response.data.map(mapSession);
	}

	static async createSession(title?: string): Promise<ChatSessionSummary> {
		const response = await instance.post<BackendChatSession>('/chat/sessions', {
			title,
		});
		return mapSession(response.data);
	}

	static async getMessages(chatId: string): Promise<AssistantMessage[]> {
		const response = await instance.get<BackendChatMessage[]>(
			`/chat/sessions/${chatId}/messages`,
		);
		return response.data.map(mapMessage);
	}

	static async deleteSession(chatId: string): Promise<void> {
		await instance.delete(`/chat/sessions/${chatId}`);
	}
}
