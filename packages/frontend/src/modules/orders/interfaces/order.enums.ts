export enum OrderStatus {
	NEW = 'NEW',
	IN_PROGRESS = 'IN_PROGRESS',
	WAITING_PARTS = 'WAITING_PARTS',
	COMPLETED = 'COMPLETED',
	PAID = 'PAID',
	CANCELLED = 'CANCELLED',
}

export enum OrderPriority {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
}
