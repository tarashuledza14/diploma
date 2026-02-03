import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/shared/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/shared/components/data-table/data-table-advanced-toolbar';
import { DataTableFilterList } from '@/shared/components/data-table/data-table-filter-list';
import { DataTableSortList } from '@/shared/components/data-table/data-table-sort-list';
import { useMemo } from 'react';
import { Client } from '../clients/interfaces/client.interface';
import { getClientTableColumns } from './client-table-columns';

interface ClientTableProps {
	data: Client[];
	pageCount: number;
	isLoading?: boolean;
}

export function ClientTable({ data, pageCount, isLoading }: ClientTableProps) {
	const columns = useMemo(() => getClientTableColumns(), []);
	const { table, shallow, debounceMs, throttleMs } = useDataTable<Client>({
		data,
		columns,
		pageCount,
		enableAdvancedFilter: true,
		initialState: {
			sorting: [{ id: 'fullName', desc: true }],
			columnPinning: { right: ['actions'] },
		},
		getRowId: originalRow => originalRow.id,
		shallow: false,
		clearOnDefault: true,
	});

	return (
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
			</DataTableAdvancedToolbar>
		</DataTable>
	);
}
