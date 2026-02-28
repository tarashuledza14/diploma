export const serviceKeys = {
	all: ['services'] as const,
	lists: () => [...serviceKeys.all, 'list'] as const,
	list: (filters?: Record<string, any>) =>
		[...serviceKeys.lists(), { filters }] as const,
	details: () => [...serviceKeys.all, 'detail'] as const,
	detail: (id: string | number) => [...serviceKeys.details(), id] as const,
	categories: () => [...serviceKeys.all, 'categories'] as const,
	mutations: {
		delete: () => [...serviceKeys.all, 'mutations', 'delete'] as const,
		update: (id: string | number) =>
			[...serviceKeys.all, 'mutations', 'update', id] as const,
		updateBulk: () =>
			[...serviceKeys.all, 'mutations', 'update-bulk'] as const,
		create: () => [...serviceKeys.all, 'mutations', 'create'] as const,
	},
};
