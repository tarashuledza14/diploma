export type AppCurrency = 'UAH' | 'USD' | 'EUR';

export interface AppBranding {
	appName: string;
	currency: AppCurrency;
	logoUrl: string | null;
}

export interface UpdateAppBrandingPayload {
	appName: string;
	currency: AppCurrency;
}

export interface UseAppBrandingQueryOptions {
	enabled?: boolean;
}
