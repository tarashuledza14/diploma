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
import { VehicleWithOwnerInfo } from '../interfaces/get-vehicle.interface';
import { StatusCounts } from '../interfaces/status-counts.interface';
import { getVehicleTableColumns } from './columns-data/vehicle-table-columns';
import { EditVehicleDialog } from './EditVehicleDialog';
import { VehicleTableActionBar } from './VehicleTableActionBar';
import { ViewVehicleDetailsDialog } from './ViewVehicleDetailsDialog';

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
	const { t } = useTranslation();
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<VehicleWithOwnerInfo> | null>(null);

	const columns = useMemo(
		() => getVehicleTableColumns({ setRowAction, statusCounts, t }),
		[setRowAction, statusCounts, t],
	);
	const { table, shallow, debounceMs, throttleMs } =
		useDataTable<VehicleWithOwnerInfo>({
			data,
			columns,
			pageCount,
			enableAdvancedFilter: true,
			initialState: {
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
		<>
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
			</DataTable>

			<EditVehicleDialog
				open={!!rowAction && rowAction.variant === 'update'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedVehicle={rowAction?.row ? rowAction.row.original : undefined}
			/>

			<ViewVehicleDetailsDialog
				open={!!rowAction && rowAction.variant === 'view'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedVehicle={rowAction?.row ? rowAction.row.original : undefined}
			/>
		</>
	);
}
