export const clientKeys = {
	all: ['clients'] as const,
	lists: () => [...clientKeys.all, 'list'] as const,
	list: (params: Record<string, unknown>) =>
		[...clientKeys.lists(), params] as const,
	details: () => [...clientKeys.all, 'details'] as const,
	detail: (id: string) => [...clientKeys.details(), id] as const,
	mutations: {
		delete: ['clients', 'delete'] as const,
		update: (id: string) => ['clients', 'update', id] as const,
		create: ['clients', 'create'] as const,
	},
};
