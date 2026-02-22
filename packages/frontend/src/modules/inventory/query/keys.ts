export const inventoryKeys = {
	all: ['inventory'] as const,
	byId: (id: string) => [...inventoryKeys.all, 'by-id', id] as const,
	lists: () => [...inventoryKeys.all, 'list'] as const,
	list: (params: Record<string, unknown>) =>
		[...inventoryKeys.lists(), params] as const,
	statusCounts: () => [...inventoryKeys.all, 'status-counts'] as const,
	dictionaries: () => [...inventoryKeys.all, 'dictionaries'] as const,
	stats: () => [...inventoryKeys.all, 'stats'] as const,
	movements: (partId: string) =>
		[...inventoryKeys.byId(partId), 'movements'] as const,
	mutations: {
		add: () => [...inventoryKeys.all, 'mutations', 'add'] as const,
		update: (id: string) =>
			[...inventoryKeys.all, 'mutations', 'update', id] as const,
		updateBulk: () =>
			[...inventoryKeys.all, 'mutations', 'update-bulk'] as const,
		deleteBulk: () =>
			[...inventoryKeys.all, 'mutations', 'delete-bulk'] as const,
	},
};
