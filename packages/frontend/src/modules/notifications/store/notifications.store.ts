import { create } from 'zustand';
import { NotificationItem } from '../types';

function sortByCreatedAtDesc(items: NotificationItem[]) {
	return [...items].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

function countUnread(items: NotificationItem[]) {
	return items.reduce((sum, item) => (item.isRead ? sum : sum + 1), 0);
}

function upsertById(
	items: NotificationItem[],
	next: NotificationItem,
): NotificationItem[] {
	const index = items.findIndex(item => item.id === next.id);
	if (index === -1) {
		return sortByCreatedAtDesc([next, ...items]);
	}

	const cloned = [...items];
	cloned[index] = {
		...cloned[index],
		...next,
	};

	return sortByCreatedAtDesc(cloned);
}

interface NotificationsState {
	unreadCount: number;
	items: NotificationItem[];
	setUnreadCount: (count: number) => void;
	setItems: (items: NotificationItem[]) => void;
	upsertNotification: (notification: NotificationItem) => void;
	markAsReadLocal: (id: string) => void;
	markAllAsReadLocal: () => void;
	reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>(set => ({
	unreadCount: 0,
	items: [],
	setUnreadCount: count => set({ unreadCount: Math.max(0, count) }),
	setItems: items => {
		const normalized = sortByCreatedAtDesc(items);
		set({
			items: normalized,
			unreadCount: countUnread(normalized),
		});
	},
	upsertNotification: notification =>
		set(state => {
			const items = upsertById(state.items, notification);
			return {
				items,
				unreadCount: countUnread(items),
			};
		}),
	markAsReadLocal: id =>
		set(state => {
			const items = state.items.map(item =>
				item.id === id ? { ...item, isRead: true } : item,
			);
			return {
				items,
				unreadCount: countUnread(items),
			};
		}),
	markAllAsReadLocal: () =>
		set(state => {
			const items = state.items.map(item => ({ ...item, isRead: true }));
			return {
				items,
				unreadCount: 0,
			};
		}),
	reset: () => set({ unreadCount: 0, items: [] }),
}));
