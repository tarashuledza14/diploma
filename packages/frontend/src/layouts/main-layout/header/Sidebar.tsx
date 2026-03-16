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
import { useTranslation } from 'react-i18next';
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
import { useUserStore } from '@/modules/auth';
import { UserRole } from '@/shared/interfaces/user.interface';

interface NavItem {
	title: string;
	url: string;
	icon: LucideIcon;
	allowedRoles?: UserRole[];
}

interface NavGroup {
	label: string;
	items: NavItem[];
}

export function AppSidebar() {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const role = useUserStore(state => state.user?.role);
	const navGroups: NavGroup[] = [
		{
			label: t('sidebar.groups.platform'),
			items: [
				{
					title: t('sidebar.items.dashboard'),
					url: '/',
					icon: LayoutDashboard,
				},
				{
					title: t('sidebar.items.orders'),
					url: '/my-tasks',
					icon: ClipboardList,
					allowedRoles: ['MECHANIC'],
				},
				{
					title: t('sidebar.items.aiAssistant'),
					url: '/assistant',
					icon: Bot,
				},
			],
		},
		{
			label: t('sidebar.groups.management'),
			items: [
				{
					title: t('sidebar.items.orders'),
					url: '/orders',
					icon: ClipboardList,
					allowedRoles: ['ADMIN', 'MANAGER'],
				},
				{
					title: t('sidebar.items.kanbanBoard'),
					url: '/orders/board',
					icon: Kanban,
					allowedRoles: ['ADMIN', 'MANAGER'],
				},
				{ title: t('sidebar.items.clients'), url: '/clients', icon: Users },
			],
		},
		{
			label: t('sidebar.groups.inventoryService'),
			items: [
				{ title: t('sidebar.items.vehicles'), url: '/vehicles', icon: Car },
				{
					title: t('sidebar.items.services'),
					url: '/services',
					icon: Wrench,
					allowedRoles: ['ADMIN', 'MANAGER'],
				},
				{
					title: t('sidebar.items.partsInventory'),
					url: '/inventory',
					icon: Package,
					allowedRoles: ['ADMIN', 'MANAGER'],
				},
			],
		},
	];

	const visibleGroups = navGroups
		.map(group => ({
			...group,
			items: group.items.filter(
				item => !item.allowedRoles || (role ? item.allowedRoles.includes(role) : false),
			),
		}))
		.filter(group => group.items.length > 0);

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
									<span className='truncate font-semibold'>
										{t('sidebar.brand.name')}
									</span>
									<span className='truncate text-xs'>
										{t('sidebar.brand.plan')}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{visibleGroups.map(group => (
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
									tooltip={t('sidebar.items.settings')}
								>
									<Link to='/settings'>
										<Settings />
										<span>{t('sidebar.items.settings')}</span>
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
