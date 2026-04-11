export const teamKeys = {
	all: ['team'] as const,
	users: () => [...teamKeys.all, 'users'] as const,
	mutations: {
		create: () => [...teamKeys.all, 'mutations', 'create'] as const,
		update: () => [...teamKeys.all, 'mutations', 'update'] as const,
		block: () => [...teamKeys.all, 'mutations', 'block'] as const,
	},
};
