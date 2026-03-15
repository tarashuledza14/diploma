import { OrdersService } from '@/modules/orders/api';
import { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { ordersKeys } from '@/modules/orders/queries/keys';
import { formatOrderNumber } from '@/modules/orders/utils/format-order-number';
import { DeleteConfirmationModal } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface DeleteConfirmOrderModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedOrder?: OrderListItem | null;
}

export function DeleteConfirmOrderModal({
	open,
	onOpenChange,
	selectedOrder,
}: DeleteConfirmOrderModalProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'delete-single'],
		mutationFn: (orderId: string) => OrdersService.deleteOrder(orderId),
		onSuccess: () => {
			toast.success(t('orders.messages.deleteSuccess'));
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});
		},
		onError: () => {
			toast.error(t('orders.messages.deleteError'));
		},
	});

	const onConfirm = () => {
		if (selectedOrder) {
			mutate(selectedOrder.id);
		}
	};

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title={t('orders.dialogs.deleteTitle')}
			description={t('orders.dialogs.deleteDescription')}
			confirmText={t('common.delete')}
			cancelText={t('common.cancel')}
			loadingText={t('common.deleting')}
			isLoading={isPending}
			onConfirm={onConfirm}
		>
			{selectedOrder && (
				<div className='flex flex-col gap-1'>
					<p className='font-medium'>
						{formatOrderNumber(selectedOrder.orderNumber)}
					</p>
					<p className='text-sm text-muted-foreground'>
						{selectedOrder.client.fullName}
					</p>
				</div>
			)}
		</DeleteConfirmationModal>
	);
}
