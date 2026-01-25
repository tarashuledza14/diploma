import { LogOut, Settings, User } from 'lucide-react';
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

const user = {
	name: 'John Doe',
	email: 'john.doe@autocrm.com',
	role: 'Admin',
	avatar: '',
};

export function UserMenu() {
	const onLogout = () => {};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='flex items-center gap-3'>
					<Avatar className='h-8 w-8'>
						<AvatarImage
							src={user.avatar || '/placeholder.svg'}
							alt={user.name}
						/>
						<AvatarFallback>
							{user.name
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<div className='hidden flex-col items-start md:flex'>
						<span className='text-sm font-medium'>{user.name}</span>
						<span className='text-xs text-muted-foreground'>{user.role}</span>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<User className='mr-2 h-4 w-4' />
					Profile
					{/* TODO: Navigate to /profile */}
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Settings className='mr-2 h-4 w-4' />
					Settings
					{/* TODO: Navigate to /settings */}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onLogout} className='text-destructive'>
					<LogOut className='mr-2 h-4 w-4' />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
