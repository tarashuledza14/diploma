import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { InventoryService } from '../../api/inventory.service';
import { InventoryPart } from '../../interfaces/inventory.interfaces';
import { inventoryKeys } from '../../query/keys';
import { getInventoryTableColumns } from './columns/inventory-table-columns';
import { ViewPartModal } from './view-part-detail/ViewPartModal';
interface InventoryTableProps {
	data: InventoryPart[];
	pageCount: number;
}
export function InventoryTable({ data, pageCount }: InventoryTableProps) {
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<InventoryPart> | null>(null);

	const { data: dictionaries } = useQuery({
		queryKey: inventoryKeys.dictionaries(),
		queryFn: () => InventoryService.getAllDictionaries(),
	});

	const columns = useMemo(
		() => getInventoryTableColumns({ setRowAction, dictionaries }),
		[setRowAction, dictionaries],
	);
	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount,

		initialState: {
			columnVisibility: {
				oem: false,
				barcode: false,
			},
			columnPinning: { right: ['actions'] },
		},
		getRowId: row => row.id,
	});

	return (
		<>
			<DataTable table={table}>
				<DataTableAdvancedToolbar table={table}>
					<DataTableSortList table={table} align='start' />
					<DataTableFilterList
						table={table}
						shallow={shallow}
						debounceMs={debounceMs}
						throttleMs={throttleMs}
						align='start'
					/>
					{/* <DataTableFilterMenu
					table={table}
					shallow={shallow}
					debounceMs={debounceMs}
					throttleMs={throttleMs}
				/> */}
					{/* <DataTableToolbar table={table}>
					<DataTableSortList table={table} align='end' />
				</DataTableToolbar> */}
				</DataTableAdvancedToolbar>
				<ViewPartModal
					selectedPart={rowAction?.row?.original || null}
					open={!!rowAction && rowAction.variant === 'view'}
					onOpenChange={open => {
						if (!open) setRowAction(null);
					}}
					handleEdit={function (part: InventoryPart): void {
						// throw new Error('Function not implemented.');
					}}
					handleHistory={function (part: InventoryPart): void {
						// throw new Error('Function not implemented.');
					}}
				/>
			</DataTable>
		</>
	);
}
