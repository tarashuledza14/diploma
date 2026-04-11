export interface AppBranding {
	appName: string;
	logoUrl: string | null;
}

export interface UpdateAppBrandingPayload {
	appName: string;
}

export interface UseAppBrandingQueryOptions {
	enabled?: boolean;
}
