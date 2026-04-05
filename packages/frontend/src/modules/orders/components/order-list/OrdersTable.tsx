import { useUserStore } from '@/modules/auth';
import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderList, OrderListItem } from '../../interfaces/order.interface';
import { getOrderTableColumns } from './columns-data/order-table-columns';
import { DeleteConfirmOrderModal } from './DeleteConfirmOrderModal';
import { EditOrderModal } from './EditOrderModal';
import { priorityColors, statusColors } from './orderColors';
import { OrdersTableActionBar } from './OrdersTableActionBar';

interface OrdersTableProps {
	data: OrderList;
	pageCount: number;
}

export function OrdersTable({ data, pageCount }: OrdersTableProps) {
	const { t, i18n } = useTranslation();
	const role = useUserStore(state => state.user?.role);
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<OrderListItem> | null>(null);
	console.log('data', data);
	const columns = useMemo(
		() =>
			getOrderTableColumns({
				setRowAction,
				statusColors,
				priorityColors,
				t,
				role,
			}),
		[setRowAction, t, role, i18n.resolvedLanguage],
	);

	const { table, shallow, debounceMs, throttleMs } =
		useDataTable<OrderListItem>({
			data,
			columns,
			pageCount,
			enableAdvancedFilter: true,
			initialState: {
				sorting: [{ id: 'orderNumber', desc: true }],
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
				actionBar={<OrdersTableActionBar table={table} role={role} />}
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
				open={
					role !== 'MECHANIC' && !!rowAction && rowAction.variant === 'update'
				}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				order={rowAction?.row?.original ?? null}
			/>

			<DeleteConfirmOrderModal
				open={
					role !== 'MECHANIC' && !!rowAction && rowAction.variant === 'delete'
				}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedOrder={rowAction?.row?.original ?? null}
			/>
		</>
	);
}
