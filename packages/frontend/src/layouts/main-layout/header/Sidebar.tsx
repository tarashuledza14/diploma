import { cn } from '@/shared/lib/utils';
import {
	Bot,
	Car,
	ClipboardList,
	Kanban,
	LayoutDashboard,
	Package,
	Settings,
	Users,
	Wrench,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';

const navigationItems = [
	{
		title: 'Dashboard',
		href: '/',
		icon: LayoutDashboard,
	},
	{
		title: 'Orders',
		href: '/orders',
		icon: ClipboardList,
	},
	{
		title: 'Kanban Board',
		href: '/orders/board',
		icon: Kanban,
	},
	{
		title: 'Clients',
		href: '/clients',
		icon: Users,
	},
	{
		title: 'Vehicles',
		href: '/vehicles',
		icon: Car,
	},
	{
		title: 'Services',
		href: '/services',
		icon: Wrench,
	},
	{
		title: 'Parts Inventory',
		href: '/inventory',
		icon: Package,
	},
	{
		title: 'AI Assistant',
		href: '/assistant',
		icon: Bot,
	},
	{
		title: 'Settings',
		href: '/settings',
		icon: Settings,
	},
];

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const { pathname } = useLocation();

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname === href;
	};

	return (
		<aside
			className={cn(
				'flex h-screen w-64 flex-col border-r border-border bg-sidebar',
				className,
			)}
		>
			{/* Logo / Brand */}
			<div className='flex h-16 items-center gap-2 border-b border-sidebar-border px-6'>
				<Car className='h-8 w-8 text-sidebar-primary' />
				<span className='text-xl font-bold text-sidebar-foreground'>
					AutoCRM
				</span>
			</div>

			{/* Navigation */}
			<ScrollArea className='flex-1 px-3 py-4'>
				<nav className='flex flex-col gap-1'>
					{navigationItems.map(item => {
						const active = isActive(item.href);
						return (
							<Link key={item.href} to={item.href}>
								<Button
									variant={active ? 'secondary' : 'ghost'}
									className={cn(
										'w-full justify-start gap-3',
										active
											? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
											: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
									)}
								>
									<item.icon className='h-5 w-5' />
									{item.title}
								</Button>
							</Link>
						);
					})}
				</nav>
			</ScrollArea>

			{/* Footer */}
			<div className='border-t border-sidebar-border p-4'>
				<p className='text-xs text-muted-foreground'>© 2026 AutoCRM v1.0</p>
			</div>
		</aside>
	);
}
