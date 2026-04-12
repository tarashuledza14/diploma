export const compactSecondaryBadgeClass = 'text-xs';

const softBadgePalette = {
	blue: 'bg-blue-100 text-blue-700',
	amber: 'bg-amber-100 text-amber-700',
	orange: 'bg-orange-100 text-orange-700',
	green: 'bg-green-100 text-green-700',
	emerald: 'bg-emerald-100 text-emerald-700',
	red: 'bg-red-100 text-red-700',
	purple: 'bg-purple-100 text-purple-700',
	slate: 'bg-slate-100 text-slate-700',
} as const;

export const orderStatusColors: Record<string, string> = {
	NEW: softBadgePalette.blue,
	IN_PROGRESS: softBadgePalette.amber,
	WAITING_PARTS: softBadgePalette.orange,
	COMPLETED: softBadgePalette.green,
	PAID: softBadgePalette.emerald,
	CANCELLED: softBadgePalette.red,
	// legacy lowercase (mock data)
	new: softBadgePalette.blue,
	in_progress: softBadgePalette.amber,
	waiting_parts: softBadgePalette.orange,
	done: softBadgePalette.green,
};

export const orderPriorityColors: Record<string, string> = {
	LOW: softBadgePalette.green,
	MEDIUM: softBadgePalette.amber,
	HIGH: softBadgePalette.red,
	// legacy lowercase
	low: softBadgePalette.green,
	medium: softBadgePalette.amber,
	high: softBadgePalette.red,
};

export const serviceStatusColors: Record<'ACTIVE' | 'INACTIVE', string> = {
	ACTIVE: softBadgePalette.green,
	INACTIVE: softBadgePalette.slate,
};

export const inventoryConditionColors: Record<
	'NEW' | 'USED' | 'REFURBISHED' | 'UNKNOWN',
	string
> = {
	NEW: softBadgePalette.green,
	USED: softBadgePalette.amber,
	REFURBISHED: softBadgePalette.blue,
	UNKNOWN: softBadgePalette.slate,
};

export const inventoryMovementColors: Record<
	'RECEIVED' | 'ISSUED' | 'RESERVED' | 'RETURNED' | 'UNKNOWN',
	string
> = {
	RECEIVED: softBadgePalette.green,
	ISSUED: softBadgePalette.blue,
	RESERVED: softBadgePalette.amber,
	RETURNED: softBadgePalette.purple,
	UNKNOWN: softBadgePalette.slate,
};
