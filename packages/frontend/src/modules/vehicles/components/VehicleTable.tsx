import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { VehicleWithOwnerInfo } from '../interfaces/get-vehicle.interface';
import { StatusCounts } from '../interfaces/status-counts.interface';
import { getVehicleTableColumns } from './columns-data/vehicle-table-columns';
import { VehicleTableActionBar } from './VehicleTableActionBar';

interface VehicleTableProps {
	data: VehicleWithOwnerInfo[];
	pageCount: number;
	statusCounts?: StatusCounts;
}

export function VehicleTable({
	data,
	pageCount,
	statusCounts,
}: VehicleTableProps) {
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<VehicleWithOwnerInfo> | null>(null);

	const columns = useMemo(
		() => getVehicleTableColumns({ setRowAction, statusCounts }),
		[setRowAction, statusCounts],
	);
	const { table, shallow, debounceMs, throttleMs } =
		useDataTable<VehicleWithOwnerInfo>({
			data,
			columns,
			pageCount,
			enableAdvancedFilter: true,
			initialState: {
				// sorting: [{ id: 'brand', desc: true }],
				columnPinning: { right: ['actions'] },
				columnVisibility: {
					brand: false,
					model: false,
					year: false,
				},
			},
			getRowId: originalRow => originalRow.id,
			shallow: false,
			clearOnDefault: true,
		});

	return (
		<DataTable
			table={table}
			actionBar={<VehicleTableActionBar table={table} />}
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
			{/* <DeleteConfirmClientModal
				open={!!rowAction && rowAction.variant === 'delete'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedClient={rowAction?.row ? rowAction.row.original : undefined}
			/>
			<EditClientDialog
				open={!!rowAction && rowAction.variant === 'update'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedClient={rowAction?.row ? rowAction.row.original : undefined}
			/>
			<ViewProfileDetails
				open={!!rowAction && rowAction.variant === 'view'}
				setProfileModalOpen={open => {
					if (!open) setRowAction(null);
				}}
				selectedClientId={
					rowAction?.row ? rowAction.row.original.id : undefined
				}
			/> */}
		</DataTable>
	);
}
