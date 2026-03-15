import { ClientService } from '@/modules/clients/api/client.service';
import {
	AlertsCard,
	type DashboardAlert,
	DashboardHeader,
	type DashboardOrderStatusItem,
	type DashboardRecentOrder,
	type DashboardStat,
	DashboardStatsCards,
	type DashboardTopMechanic,
	OrdersOverviewCard,
	RecentOrdersCard,
	TopMechanicsCard,
} from '@/modules/dashboard';
import { OrdersService } from '@/modules/orders/api';
import { OrderStatus } from '@/modules/orders/interfaces/order.enums';
import { VehicleService } from '@/modules/vehicles/api/vehicles.service';
import { useQuery } from '@tanstack/react-query';
import { Car, ClipboardList, DollarSign, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type DashboardOrder = Awaited<
	ReturnType<typeof OrdersService.getAll>
>['data'][number] & {
	mechanic?: { id: string; fullName: string } | null;
};

const statusColors: Record<OrderStatus, string> = {
	[OrderStatus.NEW]: 'bg-blue-100 text-blue-700',
	[OrderStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-700',
	[OrderStatus.WAITING_PARTS]: 'bg-orange-100 text-orange-700',
	[OrderStatus.COMPLETED]: 'bg-green-100 text-green-700',
	[OrderStatus.PAID]: 'bg-teal-100 text-teal-700',
	[OrderStatus.CANCELLED]: 'bg-zinc-200 text-zinc-700',
};

function formatMoney(value: number) {
	return `$${value.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function parseAmount(value: string | number | null | undefined) {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

export function DashboardPage() {
	const { t } = useTranslation();
	const orderStatuses: Array<{ status: OrderStatus; label: string }> = [
		{ status: OrderStatus.NEW, label: t('orderStatus.NEW') },
		{ status: OrderStatus.IN_PROGRESS, label: t('orderStatus.IN_PROGRESS') },
		{
			status: OrderStatus.WAITING_PARTS,
			label: t('orderStatus.WAITING_PARTS'),
		},
		{ status: OrderStatus.COMPLETED, label: t('orderStatus.COMPLETED') },
		{ status: OrderStatus.PAID, label: t('orderStatus.PAID') },
		{ status: OrderStatus.CANCELLED, label: t('orderStatus.CANCELLED') },
	];
	const {
		data: ordersResponse,
		isLoading: isOrdersLoading,
		isError: isOrdersError,
	} = useQuery({
		queryKey: ['dashboard', 'orders'],
		queryFn: () =>
			OrdersService.getAll({
				filters: [],
				page: 1,
				perPage: 500,
			}),
	});

	const {
		data: clientsResponse,
		isLoading: isClientsLoading,
		isError: isClientsError,
	} = useQuery({
		queryKey: ['dashboard', 'clients-total'],
		queryFn: () =>
			ClientService.getClients({
				filters: [],
				page: 1,
				perPage: 1,
			}),
	});

	const {
		data: vehiclesResponse,
		isLoading: isVehiclesLoading,
		isError: isVehiclesError,
	} = useQuery({
		queryKey: ['dashboard', 'vehicles-total'],
		queryFn: () =>
			VehicleService.getAll({
				filters: [],
				page: 1,
				perPage: 1,
			}),
	});

	const isLoading = isOrdersLoading || isClientsLoading || isVehiclesLoading;
	const hasError = isOrdersError || isClientsError || isVehiclesError;

	const orders = (ordersResponse?.data ?? []) as DashboardOrder[];
	const totalOrders = ordersResponse?.total ?? orders.length;
	const totalClients = clientsResponse?.total ?? 0;
	const totalVehicles = vehiclesResponse?.total ?? 0;

	const paidOrCompletedRevenue = orders.reduce((sum, order) => {
		if (
			order.status === OrderStatus.PAID ||
			order.status === OrderStatus.COMPLETED
		) {
			return sum + parseAmount(order.totalAmount);
		}
		return sum;
	}, 0);

	const completedCount = orders.filter(
		order =>
			order.status === OrderStatus.COMPLETED ||
			order.status === OrderStatus.PAID,
	).length;

	const completionRate =
		totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0;

	const stats: DashboardStat[] = [
		{
			title: t('dashboard.stats.totalOrders.title'),
			value: totalOrders.toString(),
			change: `${completionRate.toFixed(0)}%`,
			trend:
				completionRate >= 60 ? 'up' : completionRate >= 35 ? 'neutral' : 'down',
			icon: ClipboardList,
			description: t('dashboard.stats.totalOrders.description'),
		},
		{
			title: t('dashboard.stats.activeClients.title'),
			value: totalClients.toString(),
			change: `${orders.length}`,
			trend: 'neutral',
			icon: Users,
			description: t('dashboard.stats.activeClients.description'),
		},
		{
			title: t('dashboard.stats.vehiclesServiced.title'),
			value: totalVehicles.toString(),
			change: `${completedCount}`,
			trend: 'neutral',
			icon: Car,
			description: t('dashboard.stats.vehiclesServiced.description'),
		},
		{
			title: t('dashboard.stats.revenue.title'),
			value: formatMoney(paidOrCompletedRevenue),
			change: `${completedCount}`,
			trend: paidOrCompletedRevenue > 0 ? 'up' : 'neutral',
			icon: DollarSign,
			description: t('dashboard.stats.revenue.description'),
		},
	];

	const ordersByStatus: DashboardOrderStatusItem[] = orderStatuses.map(
		item => ({
			status: item.status,
			label: item.label,
			count: orders.filter(order => order.status === item.status).length,
		}),
	);

	const recentOrders: DashboardRecentOrder[] = [...orders]
		.sort((a, b) => {
			const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
			const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
			return dateB - dateA;
		})
		.slice(0, 5)
		.map(order => ({
			id: order.id,
			client: order.client.fullName,
			vehicle: `${order.vehicle.year} ${order.vehicle.brand} ${order.vehicle.model}`,
			status: order.status,
			avatar: null,
		}));

	const mechanicsStats = new Map<
		string,
		{ id: string; name: string; orders: number; avatar?: string | null }
	>();

	for (const order of orders) {
		if (!order.mechanic) {
			continue;
		}

		const existing = mechanicsStats.get(order.mechanic.id);
		if (existing) {
			existing.orders += 1;
			continue;
		}

		mechanicsStats.set(order.mechanic.id, {
			id: order.mechanic.id,
			name: order.mechanic.fullName,
			orders: 1,
			avatar: null,
		});
	}

	const maxMechanicOrders = Math.max(
		1,
		...Array.from(mechanicsStats.values()).map(item => item.orders),
	);

	const topMechanics: DashboardTopMechanic[] = Array.from(
		mechanicsStats.values(),
	)
		.sort((a, b) => b.orders - a.orders)
		.slice(0, 3)
		.map(mechanic => ({
			...mechanic,
			rating: Number((4 + mechanic.orders / maxMechanicOrders).toFixed(1)),
		}));

	const alerts: DashboardAlert[] = [
		...(ordersByStatus.find(item => item.status === OrderStatus.WAITING_PARTS)
			?.count
			? [
					{
						type: 'warning' as const,
						message: t('dashboard.alerts.waitingParts', {
							count: ordersByStatus.find(
								item => item.status === OrderStatus.WAITING_PARTS,
							)?.count,
						}),
						link: '/orders/board',
					},
				]
			: []),
		...(ordersByStatus.find(item => item.status === OrderStatus.IN_PROGRESS)
			?.count
			? [
					{
						type: 'info' as const,
						message: t('dashboard.alerts.inProgress', {
							count: ordersByStatus.find(
								item => item.status === OrderStatus.IN_PROGRESS,
							)?.count,
						}),
						link: '/orders/board',
					},
				]
			: []),
		...(completedCount
			? [
					{
						type: 'success' as const,
						message: t('dashboard.alerts.completedOrPaid', {
							count: completedCount,
						}),
						link: '/orders',
					},
				]
			: []),
	];

	if (hasError) {
		return (
			<div className='flex flex-col gap-6'>
				<DashboardHeader />
				<div className='rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'>
					{t('dashboard.errorLoad')}
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='flex flex-col gap-6'>
				<DashboardHeader />
				<div className='rounded-lg border p-4 text-sm text-muted-foreground'>
					{t('dashboard.loading')}
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6'>
			<DashboardHeader />
			<DashboardStatsCards stats={stats} />
			<div className='grid gap-6 lg:grid-cols-3'>
				<OrdersOverviewCard
					ordersByStatus={ordersByStatus}
					totalOrders={totalOrders}
				/>
				<AlertsCard alerts={alerts} />
			</div>
			<div className='grid gap-6 lg:grid-cols-2'>
				<RecentOrdersCard
					recentOrders={recentOrders}
					statusColors={statusColors}
				/>
				<TopMechanicsCard topMechanics={topMechanics} />
			</div>
		</div>
	);
}
