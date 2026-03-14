import { OrdersService } from '@/modules/orders/api';
import { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { ordersKeys } from '@/modules/orders/queries/keys';
import { formatOrderNumber } from '@/modules/orders/utils/format-order-number';
import { DeleteConfirmationModal } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'delete-single'],
		mutationFn: (orderId: string) => OrdersService.deleteOrder(orderId),
		onSuccess: () => {
			toast.success('Order deleted successfully');
			onOpenChange(false);
			queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});
		},
		onError: () => {
			toast.error('Failed to delete order');
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
			title='Delete Order'
			description='Are you sure you want to delete this order? This action cannot be undone.'
			confirmText='Delete'
			cancelText='Cancel'
			loadingText='Deleting...'
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
