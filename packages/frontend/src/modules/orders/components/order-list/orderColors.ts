import {
	orderPriorityColors,
	orderStatusColors,
} from '@/shared/lib/badge-colors';

// Re-exported to keep the existing orders API stable.
export const statusColors = orderStatusColors;
export const priorityColors = orderPriorityColors;
