import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { OrderList, OrderListItem } from '../../interfaces/order.interface';
import { getOrderTableColumns } from './columns-data/order-table-columns';
import { EditOrderModal } from './EditOrderModal';
import { priorityColors, statusColors } from './orderColors';
import { OrdersTableActionBar } from './OrdersTableActionBar';

interface OrdersTableProps {
	data: OrderList;
	pageCount: number;
}

export function OrdersTable({ data, pageCount }: OrdersTableProps) {
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<OrderListItem> | null>(null);

	const columns = useMemo(
		() => getOrderTableColumns({ setRowAction, statusColors, priorityColors }),
		[setRowAction],
	);

	const { table, shallow, debounceMs, throttleMs } =
		useDataTable<OrderListItem>({
			data,
			columns,
			pageCount,
			enableAdvancedFilter: true,
			initialState: {
				columnPinning: { right: ['actions'] },
			},
			getRowId: row => row.id,
			shallow: false,
			clearOnDefault: true,
		});

	return (
		<>
			<DataTable
				table={table}
				actionBar={<OrdersTableActionBar table={table} />}
			>
				<DataTableAdvancedToolbar table={table}>
					<DataTableSortList table={table} align='start' />
					<DataTableFilterList
						table={table}
						shallow={shallow}
						debounceMs={debounceMs}
						throttleMs={throttleMs}
						align='start'
					/>
				</DataTableAdvancedToolbar>
			</DataTable>

			<EditOrderModal
				open={!!rowAction && rowAction.variant === 'update'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				order={rowAction?.row?.original ?? null}
			/>
		</>
	);
}
