import { DeleteConfirmationModal } from '@/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationKey: clientKeys.mutations.delete,
		mutationFn: (clientId: string) => ClientService.deleteClient(clientId),
		onSuccess: () => {
			toast.success(t('clients.messages.deleteSuccess'));
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: clientKeys.all,
			});
		},
		onError: () => {
			toast.error(t('clients.messages.deleteError'));
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
			title={t('clients.dialogs.deleteTitle')}
			description={t('clients.dialogs.deleteDescription')}
			confirmText={t('common.delete')}
			cancelText={t('common.cancel')}
			loadingText={t('common.deleting')}
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
