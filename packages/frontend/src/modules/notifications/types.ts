export interface NotificationItem {
	id: string;
	userId: string;
	type: string;
	title?: string | null;
	message: string;
	isRead: boolean;
	createdAt: string;
	metadata?: Record<string, unknown> | null;
}

export type RealtimeNotification = NotificationItem;
