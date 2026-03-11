// Кольори для статусу замовлення (OrderStatus enum values)
export const statusColors: Record<string, string> = {
	NEW: 'bg-blue-100 text-blue-700',
	IN_PROGRESS: 'bg-amber-100 text-amber-700',
	WAITING_PARTS: 'bg-orange-100 text-orange-700',
	COMPLETED: 'bg-green-100 text-green-700',
	PAID: 'bg-emerald-100 text-emerald-700',
	CANCELLED: 'bg-red-100 text-red-700',
	// legacy lowercase (mock data)
	new: 'bg-blue-100 text-blue-700',
	in_progress: 'bg-amber-100 text-amber-700',
	waiting_parts: 'bg-orange-100 text-orange-700',
	done: 'bg-green-100 text-green-700',
};

// Кольори для пріоритету замовлення (OrderPriority enum values)
export const priorityColors: Record<string, string> = {
	LOW: 'bg-green-100 text-green-700',
	MEDIUM: 'bg-amber-100 text-amber-700',
	HIGH: 'bg-red-100 text-red-700',
	// legacy lowercase
	low: 'bg-green-100 text-green-700',
	medium: 'bg-amber-100 text-amber-700',
	high: 'bg-red-100 text-red-700',
};
