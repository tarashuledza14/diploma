export const dispatchKeys = {
	all: ['dispatch'] as const,
	board: () => [...dispatchKeys.all, 'board'] as const,
	mutations: {
		assignTask: () =>
			[...dispatchKeys.all, 'mutations', 'assign-task'] as const,
		updateTaskPlanning: () =>
			[...dispatchKeys.all, 'mutations', 'update-task-planning'] as const,
	},
};
