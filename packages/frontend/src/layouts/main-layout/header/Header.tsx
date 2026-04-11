import { useNotifications } from '@/modules/notifications';
import { SidebarTrigger, ThemeSwitcher } from '@/shared';
import { NotificationButton } from './NotificationButton';
import { UserMenu } from './UserMenu';

export function Header() {
	const { unreadCount } = useNotifications();

	return (
		<header className='flex h-16 items-center justify-between border-b border-border bg-background px-6'>
			<SidebarTrigger />
			{/* <SearchBar /> */}
			<div className='flex items-center gap-4'>
				<ThemeSwitcher />
				<NotificationButton count={unreadCount} />
				<UserMenu />
			</div>
		</header>
	);
}
