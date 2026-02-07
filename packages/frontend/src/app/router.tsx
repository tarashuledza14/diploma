import { createBrowserRouter } from 'react-router-dom';
// import { DashboardLayout } from '@/components/layouts/DashboardLayout';
// import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { MainLayout } from '@/layouts';
import { ProtectedRoute } from '@/modules/auth';
import { OrderDetailsPage } from '@/modules/orders';
import { VehiclesPage } from '@/modules/vehicles';
import {
	ClientsPage,
	DashboardPage,
	InventoryPage,
	KanbanPage,
	LoginPage,
	OrdersPage,
	ServicesPage,
} from '@/pages';
import { Suspense } from 'react';

// Ліниве завантаження сторінок (Code Splitting)
// const LoginPage = lazy(() => import('@/pages/LoginPage'));
// const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
// const OrdersPage = lazy(() => import('@/pages/orders/OrdersListPage'));
// const KanbanPage = lazy(() => import('@/pages/orders/KanbanPage'));
// const OrderDetailsPage = lazy(() => import('@/pages/orders/OrderDetailsPage'));
// const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));

// Компонент завантаження, поки вантажиться сторінка
const Loading = () => <div className='p-10 text-center'>Завантаження...</div>;

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
		element: <MainLayout />, // Тут живе Сайдбар і Хедер
		children: [
			// 1. Доступно всім авторизованим (Admin, Manager, Mechanic)
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
				],
			},
			{
				element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />,
				children: [
					{
						path: '/orders', // Таблиця
						element: (
							<Suspense fallback={<Loading />}>
								<OrdersPage />
							</Suspense>
						),
					},
					{
						path: '/orders/:id', // Деталі замовлення
						element: (
							<Suspense fallback={<Loading />}>
								<OrderDetailsPage />
							</Suspense>
						),
					},
					{
						path: '/orders/board', // Канбан
						element: (
							<Suspense fallback={<Loading />}>
								<KanbanPage />
							</Suspense>
						),
					},
					// {
					// 	path: '/inventory', // Склад
					// 	element: (
					// 		<Suspense fallback={<Loading />}>
					// 			<InventoryPage />
					// 		</Suspense>
					// 	),
					// },
				],
			},
			{
				path: '/inventory',
				element: <InventoryPage />,
			},
			{
				path: '/services',
				element: <ServicesPage />,
			},
			{
				path: '/vehicles',
				element: <VehiclesPage />,
			},
			{ path: '/clients', element: <ClientsPage /> },
			// { path: '/settings', element: <ClientPageDemo /> },
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
		element: <div>Сторінку не знайдено</div>,
	},
]);
