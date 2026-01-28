import {
	AlertsCard,
	DashboardHeader,
	DashboardStatsCards,
	OrdersOverviewCard,
	RecentOrdersCard,
	TopMechanicsCard,
} from '@/modules/dashboard';
import { Car, ClipboardList, DollarSign, Users } from 'lucide-react';

// Mock stats data
const stats = [
	{
		title: 'Total Orders',
		value: '156',
		change: '+12%',
		trend: 'up',
		icon: ClipboardList,
		description: 'vs last month',
	},
	{
		title: 'Active Clients',
		value: '89',
		change: '+5%',
		trend: 'up',
		icon: Users,
		description: 'vs last month',
	},
	{
		title: 'Vehicles Serviced',
		value: '234',
		change: '+18%',
		trend: 'up',
		icon: Car,
		description: 'vs last month',
	},
	{
		title: 'Revenue',
		value: '$45,231',
		change: '-3%',
		trend: 'down',
		icon: DollarSign,
		description: 'vs last month',
	},
];

const ordersByStatus = [
	{ status: 'New', count: 12, color: 'bg-blue-500' },
	{ status: 'In Progress', count: 28, color: 'bg-amber-500' },
	{ status: 'Waiting Parts', count: 8, color: 'bg-orange-500' },
	{ status: 'Completed', count: 108, color: 'bg-green-500' },
];

const recentOrders = [
	{
		id: 'ORD-007',
		client: 'David Kim',
		vehicle: '2021 Ford Focus',
		service: 'Battery Replacement',
		status: 'done',
		avatar: '/avatars/client7.jpg',
	},
	{
		id: 'ORD-006',
		client: 'Lisa Wang',
		vehicle: '2022 Honda Civic',
		service: 'AC Repair',
		status: 'done',
		avatar: '/avatars/client6.jpg',
	},
	{
		id: 'ORD-005',
		client: 'Michael Lee',
		vehicle: '2019 Toyota Camry',
		service: 'Engine Diagnostic',
		status: 'waiting_parts',
		avatar: '/avatars/client5.jpg',
	},
	{
		id: 'ORD-004',
		client: 'Emily Chen',
		vehicle: '2020 VW Golf',
		service: 'Tire Replacement',
		status: 'in_progress',
		avatar: '/avatars/client4.jpg',
	},
	{
		id: 'ORD-003',
		client: 'Robert Brown',
		vehicle: '2023 Audi A4',
		service: 'Full Service',
		status: 'in_progress',
		avatar: '/avatars/client3.jpg',
	},
];

const topMechanics = [
	{
		name: 'Mike Johnson',
		orders: 45,
		rating: 4.9,
		avatar: '/avatars/mechanic1.jpg',
	},
	{
		name: 'Tom Wilson',
		orders: 38,
		rating: 4.8,
		avatar: '/avatars/mechanic2.jpg',
	},
	{
		name: 'Sarah Davis',
		orders: 32,
		rating: 4.7,
		avatar: '/avatars/mechanic3.jpg',
	},
];

const alerts = [
	{ type: 'warning', message: '3 orders are overdue', link: '/orders' },
	{ type: 'info', message: '5 parts need to be reordered', link: '/parts' },
	{
		type: 'success',
		message: '12 orders completed this week',
		link: '/orders',
	},
];

const statusColors: Record<string, string> = {
	new: 'bg-blue-100 text-blue-700',
	in_progress: 'bg-amber-100 text-amber-700',
	waiting_parts: 'bg-orange-100 text-orange-700',
	done: 'bg-green-100 text-green-700',
};

export function DashboardPage() {
	const totalOrders = ordersByStatus.reduce((sum, o) => sum + o.count, 0);

	return (
		<div className='flex flex-col gap-6'>
			{/* Page Header */}
			<DashboardHeader />

			{/* Stats Cards */}
			<DashboardStatsCards stats={stats} />

			{/* Main Content Grid */}
			<div className='grid gap-6 lg:grid-cols-3'>
				<OrdersOverviewCard
					ordersByStatus={ordersByStatus}
					totalOrders={totalOrders}
				/>
				<AlertsCard alerts={alerts} />
			</div>

			{/* Bottom Grid */}
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
