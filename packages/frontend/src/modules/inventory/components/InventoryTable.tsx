import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import {
	InventoryDictionaries,
	InventoryPart,
} from '../interfaces/inventory.interfaces';
import { getInventoryTableColumns } from './columns/inventory-table-columns';
import { EditPartModal } from './edit-part/EditPartModal';
import { InventoryTableActionBar } from './InventoryTableActionBar';
import { MovementHistoryModal } from './movement-history/MovementHistoryModal';
import { ViewPartModal } from './view-part-detail/ViewPartModal';
interface InventoryTableProps {
	data: InventoryPart[];
	pageCount: number;
	dictionaries: InventoryDictionaries | undefined;
}
export function InventoryTable({
	data,
	pageCount,
	dictionaries,
}: InventoryTableProps) {
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<InventoryPart> | null>(null);

	// const { data: dictionaries } = useSuspenseQuery({
	// 	queryKey: inventoryKeys.dictionaries(),
	// 	queryFn: () => InventoryService.getAllDictionaries(),
	// 	staleTime: Infinity,
	// });

	const columns = useMemo(
		() => getInventoryTableColumns({ setRowAction, dictionaries }),
		[setRowAction, dictionaries],
	);
	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount: pageCount,

		initialState: {
			columnVisibility: {
				oem: false,
				barcode: false,
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
				actionBar={<InventoryTableActionBar table={table} />}
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
			</DataTable>
			<ViewPartModal
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
			/>
		</>
	);
}
