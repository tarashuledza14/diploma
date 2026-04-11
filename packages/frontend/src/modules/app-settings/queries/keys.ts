export const appSettingsKeys = {
	all: ['app-settings'] as const,
	branding: () => [...appSettingsKeys.all, 'branding'] as const,
	mutations: {
		updateBranding: () =>
			[...appSettingsKeys.all, 'mutations', 'update-branding'] as const,
	},
};
