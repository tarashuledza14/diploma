import { OrderPriority, OrderStatus } from '../interfaces/order.enums';

export const orderStatusInfo: Record<OrderStatus, { label: string }> = {
	[OrderStatus.NEW]: { label: 'New' },
	[OrderStatus.IN_PROGRESS]: { label: 'In progress' },
	[OrderStatus.WAITING_PARTS]: { label: 'Waiting parts' },
	[OrderStatus.COMPLETED]: { label: 'Completed' },
	[OrderStatus.PAID]: { label: 'Paid' },
	[OrderStatus.CANCELLED]: { label: 'Cancelled' },
};

export const orderPriorityInfo: Record<OrderPriority, { label: string }> = {
	[OrderPriority.LOW]: { label: 'Low' },
	[OrderPriority.MEDIUM]: { label: 'Medium' },
	[OrderPriority.HIGH]: { label: 'High' },
};

export const orderStatusOptions = Object.entries(orderStatusInfo).map(
	([value, info]) => ({ value: value as OrderStatus, label: info.label }),
);

export const orderPriorityOptions = Object.entries(orderPriorityInfo).map(
	([value, info]) => ({ value: value as OrderPriority, label: info.label }),
);
