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
	type LucideIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/shared';

interface NavItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

interface NavGroup {
	label: string;
	items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Platform',
		items: [
			{ title: 'Dashboard', url: '/', icon: LayoutDashboard },
			{ title: 'AI Assistant', url: '/assistant', icon: Bot },
		],
	},
	{
		label: 'Management',
		items: [
			{ title: 'Orders', url: '/orders', icon: ClipboardList },
			{ title: 'Kanban Board', url: '/orders/board', icon: Kanban },
			{ title: 'Clients', url: '/clients', icon: Users },
		],
	},
	{
		label: 'Inventory & Service',
		items: [
			{ title: 'Vehicles', url: '/vehicles', icon: Car },
			{ title: 'Services', url: '/services', icon: Wrench },
			{ title: 'Parts Inventory', url: '/inventory', icon: Package },
		],
	},
];

export function AppSidebar() {
	const { pathname } = useLocation();

	const isActive = (url: string) => pathname === url;

	return (
		<Sidebar collapsible='icon'>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' asChild>
							<Link to='/'>
								<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
									<Car className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-semibold'>AutoCRM</span>
									<span className='truncate text-xs'>Enterprise</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{NAV_GROUPS.map(group => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map(item => (
									<SidebarMenuItem key={item.url}>
										<SidebarMenuButton
											asChild
											isActive={isActive(item.url)}
											tooltip={item.title}
										>
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}

				<SidebarGroup className='mt-auto'>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive('/settings')}
									tooltip='Settings'
								>
									<Link to='/settings'>
										<Settings />
										<span>Settings</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
