import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { Order } from '../../interfaces/order.interface';
import { getOrdersTableColumns } from '../column-data/orders-column-data';

interface OrdersTableProps {
	data: Order[];
	pageCount: number;
}
export function OrdersTable({ data, pageCount }: OrdersTableProps) {
	const [rowAction, setRowAction] = useState<DataTableRowAction<any> | null>(
		null,
	);

	const columns = useMemo(
		() => getOrdersTableColumns({ setRowAction }),
		[setRowAction],
	);
	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount: pageCount,

		initialState: {
			columnVisibility: {
				// oem: false,
				// barcode: false,
			},
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
				// actionBar={<InventoryTableActionBar table={table} />}
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
			{/* <ViewPartModal
				selectedPart={rowAction?.row?.original || null}
				open={!!rowAction && rowAction.variant === 'view'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				handleEdit={() => {}}
				handleHistory={(part: InventoryPart) => {
					setRowAction({
						row: table.getRow(part.id),
						variant: 'history',
					});
				}}
			/>
			<EditPartModal
				open={!!rowAction && rowAction.variant === 'update'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				dictionaries={dictionaries}
				inventoryPart={rowAction?.row?.original || null}
			/>
			<MovementHistoryModal
				partId={rowAction?.row?.original?.id || ''}
				historyModalOpen={!!rowAction && rowAction.variant === 'history'}
				setHistoryModalOpen={open => {
					if (!open) setRowAction(null);
				}}
				partName={rowAction?.row?.original?.name || ''}
				partSku={rowAction?.row?.original?.sku || ''}
				partUnit={rowAction?.row?.original?.unit || ''}
			/> */}
		</>
	);
}
