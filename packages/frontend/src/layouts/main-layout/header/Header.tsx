import { ThemeSwitcher } from '@/shared';
import { LangSwitcher } from './LangSwitcher';
import { NotificationButton } from './NotificationButton';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

// TODO: Import useAuthStore to get current user data
// TODO: Import useNotificationStore to get unread notification count

export function Header() {
	// TODO: Get user from useAuthStore()
	// const { user, logout } = useAuthStore()

	// TODO: Get notification count from useNotificationStore()
	// const { unreadCount } = useNotificationStore()

	const mockNotificationCount = 3;

	return (
		<header className='flex h-16 items-center justify-between border-b border-border bg-background px-6'>
			<SearchBar />
			<div className='flex items-center gap-4'>
				<LangSwitcher />
				<ThemeSwitcher />
				<NotificationButton count={mockNotificationCount} />
				<UserMenu />
			</div>
		</header>
	);
}
