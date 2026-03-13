import { OrderStatus } from '@/modules/orders/interfaces/order.enums';
import type { LucideIcon } from 'lucide-react';

export type DashboardTrend = 'up' | 'down' | 'neutral';

export interface DashboardStat {
	title: string;
	value: string;
	change: string;
	trend: DashboardTrend;
	icon: LucideIcon;
	description: string;
}

export interface DashboardOrderStatusItem {
	status: OrderStatus;
	label: string;
	count: number;
}

export interface DashboardRecentOrder {
	id: string;
	client: string;
	vehicle: string;
	status: OrderStatus;
	avatar?: string | null;
}

export interface DashboardTopMechanic {
	id: string;
	name: string;
	orders: number;
	rating: number;
	avatar?: string | null;
}

export type DashboardAlertType = 'warning' | 'info' | 'success';

export interface DashboardAlert {
	type: DashboardAlertType;
	message: string;
	link: string;
}
