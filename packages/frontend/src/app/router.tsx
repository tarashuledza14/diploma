import { createBrowserRouter } from 'react-router-dom';
// import { DashboardLayout } from '@/components/layouts/DashboardLayout';
// import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
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
				<LoginPage />
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
								<DashboardPage />
							</Suspense>
						),
					},
					{
						path: '/my-tasks',
						element: (
							<Suspense fallback={<Loading />}>
								<OrdersPage />
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
								<AIAssistantPage />
							</Suspense>
						),
					},
					{
						path: '/manuals',
						element: (
							<Suspense fallback={<Loading />}>
								<ManualsPage />
							</Suspense>
						),
					},
					{
						path: '/notifications',
						element: (
							<Suspense fallback={<Loading />}>
								<NotificationsPage />
							</Suspense>
						),
					},
					{
						path: '/orders',
						element: (
							<Suspense fallback={<Loading />}>
								<OrdersPage />
							</Suspense>
						),
					},
					{
						path: '/orders/:id',
						element: (
							<Suspense fallback={<Loading />}>
								<OrderDetailsPage />
							</Suspense>
						),
					},
					{
						path: '/orders/board',
						element: (
							<Suspense fallback={<Loading />}>
								<KanbanPage />
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
								<ServicesPage />
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
								<InventoryPage />
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
						element: <VehiclePage />,
					},
					{ path: '/clients', element: <ClientsPage /> },
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
		element: <NotFoundPage />,
	},
]);
