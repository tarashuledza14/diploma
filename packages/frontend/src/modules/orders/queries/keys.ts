export const ordersKeys = {
	all: ['orders'] as const,
	lists: () => [...ordersKeys.all, 'list'] as const,
	list: (filters?: Record<string, any>) =>
		[...ordersKeys.lists(), filters] as const,
	details: () => [...ordersKeys.all, 'detail'] as const,
	detail: (id: string) => [...ordersKeys.details(), id] as const,
	meta: () => [...ordersKeys.all, 'meta'] as const,
	workload: () => [...ordersKeys.all, 'workload'] as const,
	mutations: {
		updateBulk: () => [...ordersKeys.all, 'mutations', 'update-bulk'] as const,
	},
};
