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
	KanbanPage,
	LoginPage,
	ManualsPage,
	NotificationsPage,
	OrderDetailsPage,
	OrdersPage,
	SettingsPage,
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
				<PageTitle title='Вхід'>
					<LoginPage />
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
								<PageTitle title='Головна'>
									<DashboardPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/my-tasks',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Мої задачі'>
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
								<PageTitle title='AI Асистент'>
									<AIAssistantPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/manuals',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Мануали'>
									<ManualsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/notifications',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Сповіщення'>
									<NotificationsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Замовлення'>
									<OrdersPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders/:id',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Деталі замовлення'>
									<OrderDetailsPage />
								</PageTitle>
							</Suspense>
						),
					},
					{
						path: '/orders/board',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Канбан'>
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
						path: '/services',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Послуги'>
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
						path: '/settings',
						element: (
							<Suspense fallback={<Loading />}>
								<PageTitle title='Налаштування'>
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
								<PageTitle title='Склад'>
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
							<PageTitle title='Автомобілі'>
								<VehiclePage />
							</PageTitle>
						),
					},
					{
						path: '/clients',
						element: (
							<PageTitle title='Клієнти'>
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
			<PageTitle title='Сторінку не знайдено'>
				<NotFoundPage />
			</PageTitle>
		),
	},
]);
