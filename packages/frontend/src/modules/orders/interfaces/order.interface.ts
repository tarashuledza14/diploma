import { Client } from '@/modules/clients';
import { StockMovement } from '@/modules/inventory/interfaces/get-inventory.interfaces';
import { InventoryPart } from '@/modules/inventory/interfaces/inventory.interfaces';
import { Vehicle } from '@/modules/vehicles/interfaces/vehicle.interface';
import { OrderService } from '../api';

export interface Order {
	id: string;
	status: OrderStatus;
	description?: string | null;
	totalAmount: number;
	priority: OrderPriority;

	vehicleId: string;
	vehicle: Vehicle;
	deletedAt?: Date | null;

	managerId?: string | null;
	manager?: any | null;

	mechanicId?: string | null;
	mechanic?: any | null;

	clientId: string;
	client: Client;

	parts: OrderPart[];
	services: OrderService[];

	startDate: Date;
	endDate?: Date | null;
	stockMovements: StockMovement[];
}

enum OrderStatus {
	NEW, // Нове (заявка)
	IN_PROGRESS, // В роботі (механік робить)
	WAITING_PARTS, // Очікує запчастин
	COMPLETED, // Виконано (чекає оплати/видачі)
	PAID, // Оплачено і закрито
	CANCELLED, // Скасовано
}

enum OrderPriority {
	LOW,
	MEDIUM,
	HIGH,
}
export interface OrderPart {
	id: string;

	orderId: string;
	order: Order;

	partId: string;
	part: InventoryPart;

	quantity: number; // Скільки штук використали

	// Важливо: зберігаємо ціну на момент замовлення (історія цін)
	price: number;
}
