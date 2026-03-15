import { OrdersService } from '@/modules/orders/api';
import {
	orderPriorityOptions,
	orderStatusOptions,
} from '@/modules/orders/constants/order-status.constants';
import type { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { ordersKeys } from '@/modules/orders/queries/keys';
import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Table } from '@tanstack/react-table';
import { CheckCircle2, Flag, Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface OrdersTableActionBarProps {
	table: Table<OrderListItem>;
}

export function OrdersTableActionBar({ table }: OrdersTableActionBarProps) {
	const { t } = useTranslation();
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: updateOrders } = useMutation({
		mutationKey: ordersKeys.mutations.updateBulk(),
		mutationFn: async (data: {
			ids: string[];
			status?: string;
			priority?: string;
		}) =>
			OrdersService.updateBulk(data.ids, {
				status: data.status,
				priority: data.priority,
			}),
		onSuccess: () => {
			toast.success(
				t('orders.messages.bulkUpdateSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});
		},
		onError: () => {
			toast.error(t('orders.messages.bulkUpdateError'));
		},
	});

	const { mutate: deleteOrders } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'delete-bulk'],
		mutationFn: async (ids: string[]) => OrdersService.deleteBulk(ids),
		onSuccess: () => {
			toast.success(
				t('orders.messages.bulkDeleteSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});
		},
		onError: () => {
			toast.error(t('orders.messages.bulkDeleteError'));
		},
	});

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				table.toggleAllRowsSelected(false);
			}
		},
		[table],
	);

	const onStatusChange = useCallback(
		(status: string) => {
			updateOrders({
				ids: rows.map(row => row.original.id),
				status,
			});
		},
		[rows, updateOrders],
	);

	const onPriorityChange = useCallback(
		(priority: string) => {
			updateOrders({
				ids: rows.map(row => row.original.id),
				priority,
			});
		},
		[rows, updateOrders],
	);

	const onDelete = useCallback(() => {
		deleteOrders(rows.map(row => row.original.id));
	}, [rows, deleteOrders]);

	return (
		<ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
			<ActionBarSelection>
				<span className='font-medium'>{rows.length}</span>
				<span>{t('common.selected')}</span>
				<ActionBarSeparator />
				<ActionBarClose>
					<X />
				</ActionBarClose>
			</ActionBarSelection>
			<ActionBarSeparator />
			<ActionBarGroup>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ActionBarItem>
							<CheckCircle2 />
							{t('common.status')}
						</ActionBarItem>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{orderStatusOptions.map(option => (
							<DropdownMenuItem
								key={option.value}
								className='capitalize'
								onClick={() => onStatusChange(option.value)}
							>
								{t(`orderStatus.${option.value}`)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ActionBarItem>
							<Flag />
							{t('common.priority')}
						</ActionBarItem>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{orderPriorityOptions.map(option => (
							<DropdownMenuItem
								key={option.value}
								className='capitalize'
								onClick={() => onPriorityChange(option.value)}
							>
								{t(`orderPriority.${option.value}`)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<ActionBarItem variant='destructive' onClick={onDelete}>
					<Trash2 />
					{t('common.delete')}
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
