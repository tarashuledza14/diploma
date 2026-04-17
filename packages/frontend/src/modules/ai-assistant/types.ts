export type MessageRole = 'user' | 'assistant';

export interface AssistantMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: Date;
	statusText?: string;
}

export interface ChatSessionSummary {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	lastMessage: {
		content: string;
		role: MessageRole;
		timestamp: Date;
	} | null;
}
