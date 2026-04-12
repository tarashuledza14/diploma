import {
	Bot,
	Car,
	ClipboardList,
	FileText,
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
import favicon from '../../../../favicon.svg';

import { useAppBrandingQuery } from '@/modules/app-settings';
import { useUserStore } from '@/modules/auth';
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
	useTheme,
} from '@/shared';
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
	const { chromeMode } = useTheme();
	const { pathname } = useLocation();
	const role = useUserStore(state => state.user?.role);
	const { data: branding } = useAppBrandingQuery();
	const isContrastChrome = chromeMode === 'contrast';
	const sidebarTextClass = isContrastChrome
		? 'text-zinc-100'
		: 'text-sidebar-foreground';
	const sidebarSubtleTextClass = isContrastChrome
		? 'text-zinc-400'
		: 'text-sidebar-foreground/70';
	const sidebarItemTextClass = isContrastChrome
		? 'text-zinc-100 hover:text-white data-[active=true]:text-white'
		: 'text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground';
	const brandName = branding?.appName?.trim() || t('sidebar.brand.name');
	const brandLogoUrl = branding?.logoUrl?.trim() || null;
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
				{
					title: t('sidebar.items.manuals'),
					url: '/manuals',
					icon: FileText,
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
					title: t('sidebar.items.dispatch'),
					url: '/dispatch',
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
					allowedRoles: ['ADMIN', 'MANAGER', 'MECHANIC'],
				},
			],
		},
	];

	const visibleGroups = navGroups
		.map(group => ({
			...group,
			items: group.items.filter(
				item =>
					!item.allowedRoles ||
					(role ? item.allowedRoles.includes(role) : false),
			),
		}))
		.filter(group => group.items.length > 0);

	const isActive = (url: string) => pathname === url;

	return (
		<Sidebar
			collapsible='icon'
			style={{
				color: isContrastChrome ? '#f4f4f5' : 'var(--sidebar-foreground)',
			}}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size='lg'
							asChild
							className={sidebarItemTextClass}
						>
							<Link to='/'>
								<div className='flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground'>
									{brandLogoUrl ? (
										<img
											src={brandLogoUrl}
											alt={brandName}
											className='size-full object-cover'
										/>
									) : (
										<img
											src={favicon}
											alt={brandName}
											className='size-16 object-contain'
										/>
									)}
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span
										className={`truncate font-semibold ${sidebarTextClass}`}
									>
										{brandName}
									</span>
									<span
										className={`truncate text-xs ${sidebarSubtleTextClass}`}
									>
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
						<SidebarGroupLabel className={sidebarSubtleTextClass}>
							{group.label}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map(item => (
									<SidebarMenuItem key={item.url}>
										<SidebarMenuButton
											asChild
											isActive={isActive(item.url)}
											tooltip={item.title}
											className={sidebarItemTextClass}
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

				{role === 'ADMIN' && (
					<SidebarGroup className='mt-auto'>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										isActive={isActive('/team')}
										tooltip={t('sidebar.items.team')}
										className={sidebarItemTextClass}
									>
										<Link to='/team'>
											<Users />
											<span>{t('sidebar.items.team')}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										isActive={isActive('/settings')}
										tooltip={t('sidebar.items.settings')}
										className={sidebarItemTextClass}
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
				)}
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
