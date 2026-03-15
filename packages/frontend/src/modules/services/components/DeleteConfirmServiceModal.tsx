import { DeleteConfirmationModal } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ServicesService } from '../api/services.service';
import { Service } from '../interfaces/services.interface';
import { serviceKeys } from '../queries/keys';

interface DeleteConfirmServiceModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedService?: Service | null;
}

export function DeleteConfirmServiceModal({
	open,
	onOpenChange,
	selectedService,
}: DeleteConfirmServiceModalProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: serviceKeys.mutations.delete(),
		mutationFn: (serviceId: string) => ServicesService.delete(serviceId),
		onSuccess: () => {
			toast.success(t('services.messages.deleteSuccess'));
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: serviceKeys.lists(),
			});
		},
		onError: () => {
			toast.error(t('services.messages.deleteError'));
		},
	});

	const onConfirm = () => {
		if (selectedService) {
			mutate(selectedService.id);
		}
	};

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title={t('services.dialogs.deleteTitle')}
			description={t('services.dialogs.deleteDescription')}
			confirmText={t('common.delete')}
			cancelText={t('common.cancel')}
			loadingText={t('common.deleting')}
			isLoading={isPending}
			onConfirm={onConfirm}
		>
			{selectedService && (
				<div className='flex flex-col gap-1'>
					<p className='font-medium'>{selectedService.name}</p>
					{selectedService.description && (
						<p className='text-sm text-muted-foreground'>
							{selectedService.description}
						</p>
					)}
				</div>
			)}
		</DeleteConfirmationModal>
	);
}
