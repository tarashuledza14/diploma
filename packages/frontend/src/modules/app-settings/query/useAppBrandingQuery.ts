import { useQuery } from '@tanstack/react-query';
import { AppSettingsService } from '../api/app-settings.service';
import { DEFAULT_APP_NAME } from '../constants';
import {
	AppBranding,
	UseAppBrandingQueryOptions,
} from '../interfaces/branding.interface';
import { appSettingsKeys } from '../queries/keys';

export function useAppBrandingQuery(options?: UseAppBrandingQueryOptions) {
	return useQuery<AppBranding>({
		queryKey: appSettingsKeys.branding(),
		queryFn: () => AppSettingsService.getBranding(),
		enabled: options?.enabled ?? true,
		retry: false,
		staleTime: 5 * 60 * 1000,
		placeholderData: previousData =>
			previousData ?? {
				appName: DEFAULT_APP_NAME,
				currency: 'UAH' as const,
				logoUrl: null,
			},
	});
}
