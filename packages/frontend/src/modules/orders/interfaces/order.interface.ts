import { OrderStatus } from './order-status.enum';

export interface Order {
	id: string;
	status: OrderStatus; // OrderStatus enum
	description?: string | null;
	totalAmount: number; // Decimal
	priority: 'LOW' | 'MEDIUM' | 'HIGH'; // OrderPriority enum
	vehicleId: string;
	deletedAt?: Date | null;
	managerId?: string | null;
	mechanicId?: string | null;
	clientId: string;
	startDate: Date;
	endDate?: Date | null;

	// parts: OrderPart[];
	// services: OrderService[];
}
