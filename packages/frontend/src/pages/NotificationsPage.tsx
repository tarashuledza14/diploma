import { NotificationsApi } from '@/modules/notifications/api/notifications.service';
import { useNotificationsStore } from '@/modules/notifications/store/notifications.store';
import { NotificationItem } from '@/modules/notifications/types';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NotificationsPage() {
	const { t } = useTranslation();
	const items = useNotificationsStore(state => state.items);
	const setItems = useNotificationsStore(state => state.setItems);
	const markAsReadLocal = useNotificationsStore(state => state.markAsReadLocal);
	const markAllAsReadLocal = useNotificationsStore(
		state => state.markAllAsReadLocal,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const unreadCount = useMemo(
		() => items.filter(item => !item.isRead).length,
		[items],
	);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);
		setLoadError(null);

		void NotificationsApi.getAll(200)
			.then(data => {
				if (mounted) {
					setItems(data);
				}
			})
			.catch(() => {
				if (mounted) {
					setLoadError(t('notifications.loadError'));
				}
			})
			.finally(() => {
				if (mounted) {
					setIsLoading(false);
				}
			});

		return () => {
			mounted = false;
		};
	}, [setItems, t]);

	const markAllRead = async () => {
		if (!unreadCount) {
			return;
		}

		setIsUpdating(true);
		try {
			markAllAsReadLocal();
			await NotificationsApi.markAllAsRead();
		} catch {
			const refreshed = await NotificationsApi.getAll(200);
			setItems(refreshed);
		} finally {
			setIsUpdating(false);
		}
	};

	const markOneRead = async (item: NotificationItem) => {
		if (item.isRead) {
			return;
		}

		markAsReadLocal(item.id);
		try {
			await NotificationsApi.markAsRead(item.id);
		} catch {
			const refreshed = await NotificationsApi.getAll(200);
			setItems(refreshed);
		}
	};

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-semibold'>
						{t('notifications.allTitle')}
					</h1>
					<p className='text-sm text-muted-foreground'>
						{t('notifications.allSubtitle')}
					</p>
				</div>
				<Button
					onClick={markAllRead}
					disabled={isUpdating || unreadCount === 0}
				>
					{t('notifications.markAllRead')}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('notifications.allTitle')}</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2'>
					{isLoading ? (
						<p className='text-sm text-muted-foreground'>
							{t('notifications.loading')}
						</p>
					) : loadError ? (
						<p className='text-sm text-destructive'>{loadError}</p>
					) : items.length === 0 ? (
						<div className='flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center text-muted-foreground'>
							<Bell className='h-5 w-5' />
							<p>{t('notifications.empty')}</p>
						</div>
					) : (
						items.map(item => (
							<button
								type='button'
								key={item.id}
								onClick={() => void markOneRead(item)}
								className={`w-full rounded-md border p-3 text-left transition-colors ${
									item.isRead
										? 'bg-background'
										: 'bg-accent/40 border-primary/30'
								}`}
							>
								<div className='flex items-start justify-between gap-3'>
									<p className='text-sm font-medium'>{item.message}</p>
									{!item.isRead && (
										<span className='mt-1 h-2 w-2 rounded-full bg-primary' />
									)}
								</div>
								<p className='mt-1 text-xs text-muted-foreground'>
									{new Date(item.createdAt).toLocaleString()}
								</p>
							</button>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
