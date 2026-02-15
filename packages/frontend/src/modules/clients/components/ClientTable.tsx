import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
} from '@/shared';
import { useDataTable } from '@/shared/hooks/use-data-table';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { Client } from '../interfaces/client.interface';
import { getClientTableColumns } from './client-table-columns';
import { ClientsTableActionBar } from './clients-table-action-bar';
import { DeleteConfirmClientModal } from './DeleteConfirmClientsModal';
import { EditClientDialog } from './EditClientDialog';
import { ViewProfileDetails } from './ViewProfileDetails';

interface ClientTableProps {
	data: Client[];
	pageCount: number;
	isLoading?: boolean;
}

export function ClientTable({ data, pageCount, isLoading }: ClientTableProps) {
	const [rowAction, setRowAction] = useState<DataTableRowAction<Client> | null>(
		null,
	);

	const columns = useMemo(() => getClientTableColumns({ setRowAction }), []);
	const { table, shallow, debounceMs, throttleMs } = useDataTable<Client>({
		data,
		columns,
		pageCount,
		enableAdvancedFilter: true,
		initialState: {
			sorting: [{ id: 'fullName', desc: true }],
			columnPinning: { right: ['actions'] },
			columnVisibility: {
				email: false,
				phone: false,
			},
		},
		getRowId: originalRow => originalRow.id,
		shallow: false,
		clearOnDefault: true,
	});

	return (
		<DataTable
			table={table}
			actionBar={<ClientsTableActionBar table={table} />}
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
			<DeleteConfirmClientModal
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
			/>
		</DataTable>
	);
}
