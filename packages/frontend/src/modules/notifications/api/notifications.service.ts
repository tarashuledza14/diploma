import { instance } from '@/api';
import { NotificationItem } from '../types';

type UnknownNotification = Record<string, unknown>;

function toNotificationItem(raw: UnknownNotification): NotificationItem | null {
	const id = String(raw.id ?? '');
	const userId = String(raw.userId ?? raw.user_id ?? '');
	const type = String(raw.type ?? 'SYSTEM');
	const message = String(raw.message ?? '');
	const createdAtRaw = raw.createdAt ?? raw.created_at;
	const createdAt = createdAtRaw
		? String(createdAtRaw)
		: new Date().toISOString();
	const isReadRaw = raw.isRead ?? raw.is_read;

	if (!id || !userId || !message) {
		return null;
	}

	return {
		id,
		userId,
		type,
		title: (raw.title as string | null | undefined) ?? null,
		message,
		isRead: isReadRaw === true || isReadRaw === 'true',
		createdAt,
		metadata:
			(raw.metadata as Record<string, unknown> | null | undefined) ?? null,
	};
}

function extractNotificationsPayload(payload: unknown): unknown[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (!payload || typeof payload !== 'object') {
		return [];
	}

	const value = payload as Record<string, unknown>;

	if (Array.isArray(value.data)) {
		return value.data;
	}

	if (Array.isArray(value.items)) {
		return value.items;
	}

	if (Array.isArray(value.notifications)) {
		return value.notifications;
	}

	return [];
}

export class NotificationsApi {
	private static readonly prefix = '/notifications';

	static async getUnreadCount() {
		const response = await instance.get<
			{ unreadCount: number } | { data: { unreadCount: number } }
		>(`${this.prefix}/unread-count`);

		if (
			response.data &&
			typeof response.data === 'object' &&
			'data' in response.data &&
			response.data.data &&
			typeof response.data.data === 'object' &&
			'unreadCount' in response.data.data
		) {
			return Number(response.data.data.unreadCount) || 0;
		}

		if (
			response.data &&
			typeof response.data === 'object' &&
			'unreadCount' in response.data
		) {
			return Number(response.data.unreadCount) || 0;
		}

		return 0;
	}

	static async getAll(limit = 50) {
		const response = await instance.get<unknown>(`${this.prefix}`, {
			params: { limit },
		});

		const rawItems = extractNotificationsPayload(response.data);
		return rawItems
			.filter(item => item && typeof item === 'object')
			.map(item => toNotificationItem(item as UnknownNotification))
			.filter((item): item is NotificationItem => item !== null);
	}

	static async markAsRead(id: string) {
		await instance.patch(`${this.prefix}/${id}/read`);
	}

	static async markAllAsRead() {
		await instance.patch(`${this.prefix}/read-all`);
	}
}
