import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSettingsService } from '../api/app-settings.service';
import { appSettingsKeys } from '../queries/keys';

export function useUploadLogoMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [...appSettingsKeys.all, 'mutations', 'upload-logo'],
		mutationFn: (file: File) => AppSettingsService.uploadLogo(file),
		onSuccess: branding => {
			queryClient.setQueryData(appSettingsKeys.branding(), branding);
		},
	});
}
