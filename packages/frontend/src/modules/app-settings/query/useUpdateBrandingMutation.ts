import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSettingsService } from '../api/app-settings.service';
import { UpdateAppBrandingPayload } from '../interfaces/branding.interface';
import { appSettingsKeys } from '../queries/keys';

export function useUpdateBrandingMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: appSettingsKeys.mutations.updateBranding(),
		mutationFn: (payload: UpdateAppBrandingPayload) =>
			AppSettingsService.updateBranding(payload),
		onSuccess: updatedBranding => {
			queryClient.setQueryData(appSettingsKeys.branding(), updatedBranding);
		},
	});
}
