import { NotificationsApi } from '@/modules/notifications/api/notifications.service';
import { useNotificationsStore } from '@/modules/notifications/store/notifications.store';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '../../../shared/components/ui/popover';
import { Separator } from '../../../shared/components/ui/separator';

export function NotificationButton({ count }: { count: number }) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const notifications = useNotificationsStore(state => state.items);
	const setItems = useNotificationsStore(state => state.setItems);

	useEffect(() => {
		if (!open) {
			return;
		}

		let mounted = true;
		setIsLoading(true);

		void NotificationsApi.getAll(20)
			.then(data => {
				if (mounted) {
					setItems(data);
				}
			})
			.catch(() => undefined)
			.finally(() => {
				if (mounted) {
					setIsLoading(false);
				}
			});

		return () => {
			mounted = false;
		};
	}, [open, setItems]);

	const unreadNotifications = useMemo(
		() => notifications.filter(item => !item.isRead).slice(0, 5),
		[notifications],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='ghost' size='icon' className='relative'>
					<Bell className='h-5 w-5' />
					{count > 0 && (
						<Badge
							variant='destructive'
							className='absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs leading-none'
						>
							{count}
						</Badge>
					)}
					<span className='sr-only'>{t('header.viewNotifications')}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align='end' className='w-85 p-0'>
				<div className='p-4'>
					<p className='text-sm font-semibold'>
						{t('notifications.dropdownTitle')}
					</p>
				</div>
				<Separator />
				<div className='max-h-80 overflow-y-auto px-4 py-3'>
					{isLoading ? (
						<p className='text-sm text-muted-foreground'>
							{t('notifications.loading')}
						</p>
					) : unreadNotifications.length === 0 ? (
						<p className='text-sm text-muted-foreground'>
							{t('notifications.noNew')}
						</p>
					) : (
						<div className='space-y-2'>
							{unreadNotifications.map(item => (
								<div key={item.id} className='rounded-md border bg-card p-3'>
									<p className='text-sm font-medium'>{item.message}</p>
									<p className='mt-1 text-xs text-muted-foreground'>
										{new Date(item.createdAt).toLocaleString()}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
				<Separator />
				<div className='p-2'>
					<Button
						asChild
						variant='ghost'
						className='w-full justify-center'
						onClick={() => setOpen(false)}
					>
						<Link to='/notifications'>{t('notifications.viewAll')}</Link>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
