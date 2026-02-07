import { DeleteConfirmationModal } from '@/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClientService } from '../api/client.service';
import { Client } from '../interfaces/client.interface';
import { clientKeys } from '../queries/keys';

interface DeleteConfirmClientModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedClient?: Client;
}

export function DeleteConfirmClientModal({
	open,
	onOpenChange,
	selectedClient,
}: DeleteConfirmClientModalProps) {
	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationKey: clientKeys.mutations.delete,
		mutationFn: (clientId: string) => ClientService.deleteClient(clientId),
		onSuccess: () => {
			toast.success('Client deleted successfully');
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: clientKeys.all,
			});
		},
		onError: () => {
			toast.error('Failed to delete client. Please try again.');
		},
	});

	const onConfirm = async () => {
		if (selectedClient) {
			await mutate(selectedClient.id);
		}
	};
	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title={'Delete Client'}
			description={
				'Are you sure you want to delete this client? This action cannot be undone.'
			}
			confirmText={'Delete'}
			cancelText={'Cancel'}
			loadingText={'Deleting...'}
			isLoading={isPending}
			onConfirm={onConfirm}
		>
			{selectedClient && (
				<div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
					<Avatar>
						<AvatarImage src={selectedClient.avatar || '/placeholder.svg'} />
						<AvatarFallback>
							{selectedClient.fullName
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className='font-medium'>{selectedClient.fullName}</p>
						<p className='text-sm text-muted-foreground'>
							{selectedClient.email}
						</p>
					</div>
				</div>
			)}
		</DeleteConfirmationModal>
	);
}
