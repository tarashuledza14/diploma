enum OrderStatus {
	NEW = 'NEW',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}
export interface NewOrder {
	clientId: string;
	vehicleId: string;
	services: string[];
	status: OrderStatus;
	priority: string;
	assignedMechanic: string;
	dueDate: Date | undefined;
	notes: string;
}
