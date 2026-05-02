import { instance } from '@/api';
import { getAccessToken } from '@/modules/auth';
import { useUserStore } from '@/modules/auth/store/user.store';
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { NotificationsApi } from './api/notifications.service';
import { useNotificationsStore } from './store/notifications.store';
import { RealtimeNotification } from './types';

interface NotificationsContextValue {
	connected: boolean;
	unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue>({
	connected: false,
	unreadCount: 0,
});

function getSocketBaseUrl() {
	const apiBaseUrl = instance.defaults.baseURL ?? 'http://localhost:4200/api';
	return apiBaseUrl.replace(/\/api\/?$/, '');
}

export function NotificationsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const socketRef = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);
	const user = useUserStore(state => state.user);
	const unreadCount = useNotificationsStore(state => state.unreadCount);
	const setUnreadCount = useNotificationsStore(state => state.setUnreadCount);
	const setItems = useNotificationsStore(state => state.setItems);
	const upsertNotification = useNotificationsStore(
		state => state.upsertNotification,
	);
	const reset = useNotificationsStore(state => state.reset);

	useEffect(() => {
		const accessToken = getAccessToken();

		if (!user?.id || !accessToken) {
			setConnected(false);
			reset();
			socketRef.current?.disconnect();
			socketRef.current = null;
			return;
		}

		void Promise.allSettled([
			NotificationsApi.getUnreadCount(),
			NotificationsApi.getAll(200),
		]).then(([countResult, itemsResult]) => {
			if (countResult.status === 'fulfilled') {
				console.log('📬 Unread count:', countResult.value);
				setUnreadCount(countResult.value);
			} else {
				console.error('❌ Failed to fetch unread count:', countResult.reason);
				setUnreadCount(0);
			}

			if (itemsResult.status === 'fulfilled') {
				console.log('📨 Notifications loaded:', itemsResult.value.length);
				setItems(itemsResult.value);
			} else {
				console.error('❌ Failed to fetch notifications:', itemsResult.reason);
			}
		});

		const socket = io(`${getSocketBaseUrl()}/notifications`, {
			transports: ['websocket'],
			withCredentials: true,
			auth: {
				token: accessToken,
			},
			query: {
				token: accessToken,
			},
		});

		socketRef.current = socket;

		const onConnect = () => setConnected(true);
		const onDisconnect = () => setConnected(false);
		const onNotification = (notification: RealtimeNotification) => {
			upsertNotification(notification);
			if (notification?.message) {
				toast.success(notification.message);
			}
		};

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('new_notification', onNotification);

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('new_notification', onNotification);
			socket.disconnect();
			socketRef.current = null;
			setConnected(false);
		};
	}, [user?.id, setUnreadCount, setItems, upsertNotification, reset]);

	const value = useMemo(
		() => ({
			connected,
			unreadCount,
		}),
		[connected, unreadCount],
	);

	return (
		<NotificationsContext.Provider value={value}>
			{children}
		</NotificationsContext.Provider>
	);
}

export function useNotifications() {
	return useContext(NotificationsContext);
}
