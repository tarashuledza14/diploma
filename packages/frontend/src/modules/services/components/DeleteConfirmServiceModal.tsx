import { DeleteConfirmationModal } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: serviceKeys.mutations.delete(),
		mutationFn: (serviceId: string) => ServicesService.delete(serviceId),
		onSuccess: () => {
			toast.success('Service deleted successfully');
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: serviceKeys.lists(),
			});
		},
		onError: () => {
			toast.error('Failed to delete service. Please try again.');
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
			title='Delete Service'
			description='Are you sure you want to delete this service? This action cannot be undone.'
			confirmText='Delete'
			cancelText='Cancel'
			loadingText='Deleting...'
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
