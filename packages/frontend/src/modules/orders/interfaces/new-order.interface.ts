import { OrderPriority, OrderStatus } from './order.enums';

export interface OrderServiceItem {
	serviceId: string;
	mechanicId?: string;
}

export interface OrderPartItem {
	partId: string;
	quantity: number;
}

export interface NewOrder {
	clientId: string;
	vehicleId: string;
	mileage: number;
	priority: OrderPriority;
	services: OrderServiceItem[];
	parts: OrderPartItem[];
	notes: string;
	status: OrderStatus;
}
