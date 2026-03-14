import { Client } from '@/modules/clients';
import { Service } from '@/modules/services/interfaces/services.interface';
import { Vehicle } from '@/modules/vehicles/interfaces/vehicle.interface';
import { OrderPriority, OrderStatus } from './order.enums';

export interface OrderListItem {
	id: string;
	orderNumber: number;
	endDate: string | null;
	priority: OrderPriority;
	status: OrderStatus;
	totalAmount: string;
	client: Pick<Client, 'id' | 'fullName'>;
	services: Pick<Service, 'id' | 'name'>[];
	vehicle: Vehicle;
}
export type OrderList = OrderListItem[];
