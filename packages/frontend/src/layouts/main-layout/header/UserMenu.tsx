import { removeFromStorage, useUserStore } from '@/modules/auth';
import { LogOut, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '../../../shared/components/ui/avatar';
import { Button } from '../../../shared/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';

export function UserMenu() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const user = useUserStore(state => state.user);
	const clearUser = useUserStore(state => state.clearUser);

	const displayName = user?.fullName || 'User';
	const displayRole = user?.role || 'MECHANIC';

	const onLogout = () => {
		removeFromStorage();
		clearUser();
		navigate('/login');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='flex items-center gap-3'>
					<Avatar className='h-8 w-8'>
						<AvatarImage src='/placeholder.svg' alt={displayName} />
						<AvatarFallback>
							{displayName
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<div className='hidden flex-col items-start md:flex'>
						<span className='text-sm font-medium'>{displayName}</span>
						<span className='text-xs text-muted-foreground'>{displayRole}</span>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuLabel>{t('userMenu.myAccount')}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<User className='mr-2 h-4 w-4' />
					{t('userMenu.profile')}
					{/* TODO: Navigate to /profile */}
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Settings className='mr-2 h-4 w-4' />
					{t('userMenu.settings')}
					{/* TODO: Navigate to /settings */}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onLogout} className='text-destructive'>
					<LogOut className='mr-2 h-4 w-4' />
					{t('userMenu.logout')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
