import type { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { OrdersService } from '@/modules/orders/api';
import {
	orderPriorityOptions,
	orderStatusOptions,
} from '@/modules/orders/constants/order-status.constants';
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
import { CheckCircle2, Flag, X } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface OrdersTableActionBarProps {
	table: Table<OrderListItem>;
}

export function OrdersTableActionBar({ table }: OrdersTableActionBarProps) {
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: updateOrders } = useMutation({
		mutationKey: ordersKeys.mutations.updateBulk(),
		mutationFn: async (data: {
			ids: string[];
			status?: string;
			priority?: string;
		}) => OrdersService.updateBulk(data.ids, { status: data.status, priority: data.priority }),
		onSuccess: () => {
			toast.success(`${rows.length} order(s) updated`);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});
		},
		onError: () => {
			toast.error('Failed to update orders');
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

	return (
		<ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
			<ActionBarSelection>
				<span className='font-medium'>{rows.length}</span>
				<span>selected</span>
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
							Status
						</ActionBarItem>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{orderStatusOptions.map(option => (
							<DropdownMenuItem
								key={option.value}
								className='capitalize'
								onClick={() => onStatusChange(option.value)}
							>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ActionBarItem>
							<Flag />
							Priority
						</ActionBarItem>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{orderPriorityOptions.map(option => (
							<DropdownMenuItem
								key={option.value}
								className='capitalize'
								onClick={() => onPriorityChange(option.value)}
							>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</ActionBarGroup>
		</ActionBar>
	);
}
