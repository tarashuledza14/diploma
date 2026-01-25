// Кольори для статусу замовлення
export const statusColors: Record<string, string> = {
	new: 'bg-blue-100 text-blue-700',
	in_progress: 'bg-amber-100 text-amber-700',
	waiting_parts: 'bg-orange-100 text-orange-700',
	done: 'bg-green-100 text-green-700',
};

// Кольори для пріоритету замовлення
export const priorityColors: Record<string, string> = {
	high: 'bg-red-100 text-red-700',
	medium: 'bg-amber-100 text-amber-700',
	low: 'bg-green-100 text-green-700',
};
