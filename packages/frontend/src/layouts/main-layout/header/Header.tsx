import { useNotifications } from '@/modules/notifications';
import { SidebarTrigger, ThemeSwitcher } from '@/shared';
import { NotificationButton } from './NotificationButton';
import { UserMenu } from './UserMenu';

export function Header() {
	const { unreadCount } = useNotifications();

	return (
		<header className='relative flex h-16 items-center justify-between border-b border-(--header-border) bg-(--header-bg) px-6 text-(--header-foreground) supports-backdrop-filter:backdrop-blur-md'>
			<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-(--header-accent) to-transparent opacity-80' />
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
