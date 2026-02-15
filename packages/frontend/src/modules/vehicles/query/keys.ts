export const vehicleKeys = {
	all: ['vehicles'] as const,
	byId: (id: string) => [...vehicleKeys.all, 'by-id', id] as const,
	lists: () => [...vehicleKeys.all, 'list'] as const,
	list: (params: Record<string, unknown>) =>
		[...vehicleKeys.lists(), params] as const,
	statusCounts: () => [...vehicleKeys.all, 'status-counts'] as const,
	mutations: {
		add: () => [...vehicleKeys.all, 'mutations', 'add'] as const,
		update: (id: string) =>
			[...vehicleKeys.all, 'mutations', 'update', id] as const,
		updateBulk: () => [...vehicleKeys.all, 'mutations', 'update-bulk'] as const,
	},
};
