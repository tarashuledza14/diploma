import type { Order } from '@/modules/orders';
import { Client } from './client.interface';

export interface GetClientDetailsResponse extends Client {
	orders: Order[]; // Replace with actual order type when available
	vehicles: any[]; // Replace with actual vehicle type when available
}
