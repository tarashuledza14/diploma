import { createBrowserRouter } from 'react-router-dom';
// import { DashboardLayout } from '@/components/layouts/DashboardLayout';
// import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PageTitle } from '@/app/components/PageTitle';
import { MainLayout } from '@/layouts';
import { AIAssistantPage } from '@/modules/ai-assistant/AIAssistantPage';
import { ProtectedRoute } from '@/modules/auth';
import {
	ClientsPage,
	DashboardPage,
	DispatchPage,
	KanbanPage,
	LoginPage,
	ManualsPage,
	NotificationsPage,
	OrderDetailsPage,
	OrdersPage,
	RegisterPage,
	SettingsPage,
	TeamPage,
	VehiclePage,
} from '@/pages';
import { InventoryPage } from '@/pages/InventoryPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// Ліниве завантаження сторінок (Code Splitting)
// const LoginPage = lazy(() => import('@/pages/LoginPage'));
// const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
// const OrdersPage = lazy(() => import('@/pages/orders/OrdersListPage'));
// const KanbanPage = lazy(() => import('@/pages/orders/KanbanPage'));
// const OrderDetailsPage = lazy(() => import('@/pages/orders/OrderDetailsPage'));
// const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));

// Компонент завантаження, поки вантажиться сторінка
function Loading() {
	const { t } = useTranslation();
	return <div className='p-10 text-center'>{t('router.loading')}</div>;
}

function NotFoundPage() {
	const { t } = useTranslation();
	return <div>{t('router.notFound')}</div>;
}

export const router = createBrowserRouter([
	// --- ПУБЛІЧНІ МАРШРУТИ ---
	{
		path: '/login',
		element: (
			<Suspense fallback={<Loading />}>
				<PageTitle titleKey='router.titles.login'>
					<LoginPage />
				</PageTitle>
			</Suspense>
		),
	},
	{
		path: '/register',
		element: (
			<Suspense fallback={<Loading />}>
				<PageTitle titleKey='router.titles.register'>
					<RegisterPage />
				</PageTitle>
			</Suspense>
		),
	},

	//   // --- ЗАХИЩЕНІ МАРШРУТИ (Всередині DashboardLayout) ---
	{
		element: <MainLayout />,
		children: [
			{
				element: (
					<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MECHANIC']} />
				),
				children: [
					{
						path: '/',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.dashboard'>
									<DashboardPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/my-tasks',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.myTasks'>
									<OrdersPage />
								</PageTitle>
							</Suspense>
						),
					},
				],
			},
			{
				element: (
					<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MECHANIC']} />
				),
				children: [
					{
						path: '/assistant',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.assistant'>
									<AIAssistantPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/manuals',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.manuals'>
									<ManualsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/notifications',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.notifications'>
									<NotificationsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.orders'>
									<OrdersPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders/:id',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.orderDetails'>
									<OrderDetailsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders/board',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.kanban'>
									<KanbanPage />
								</PageTitle>
							</Suspense>
						),
					},
				],
			},
			{
				element: (
					<ProtectedRoute
						allowedRoles={['ADMIN', 'MANAGER']}
						fallbackPath='/my-tasks'
					/>
				),
				children: [
					{
						path: '/dispatch',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.dispatch'>
									<DispatchPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/services',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.services'>
									<ServicesPage />
								</PageTitle>
							</Suspense>
						),
					},
				],
			},
			{
				element: <ProtectedRoute allowedRoles={['ADMIN']} fallbackPath='/' />,
				children: [
					{
						path: '/team',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.team'>
									<TeamPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/settings',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.settings'>
									<SettingsPage />
								</PageTitle>
							</Suspense>
						),
					},
				],
			},
			{
				element: (
					<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MECHANIC']} />
				),
				children: [
					{
						path: '/inventory',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle titleKey='router.titles.inventory'>
									<InventoryPage />
								</PageTitle>
							</Suspense>
						),
					},
				],
			},
			{
				element: (
					<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'MECHANIC']} />
				),
				children: [
					{
						path: '/vehicles',
						element: (
							<PageTitle titleKey='router.titles.vehicles'>
								<VehiclePage />
							</PageTitle>
						),
					},
					{
						path: '/clients',
						element: (
							<PageTitle titleKey='router.titles.clients'>
								<ClientsPage />
							</PageTitle>
						),
					},
				],
			},
		],
	},
	//
	//
	// 			],
	// 		},

	// 		// 2. Доступно ТІЛЬКИ Менеджерам і Адмінам (Склад і Таблиця замовлень)

	// --- 404 Page ---
	{
		path: '*',
		element: (
			<PageTitle titleKey='router.titles.notFound'>
				<NotFoundPage />
			</PageTitle>
		),
	},
]);
