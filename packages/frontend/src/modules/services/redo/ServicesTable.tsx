import { DataTable, DataTableToolbar, useDataTable } from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useMemo, useState } from 'react';
import { Service } from '../interfaces/services.interface';
import { getServicesTableColumns } from './columns/services-table-columns';

interface ServiceTableProps {
	data: Service[];
}
export function ServiceTable({ data }: ServiceTableProps) {
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<Service> | null>(null);
	const columns = useMemo(
		() => getServicesTableColumns({ setRowAction }),
		[setRowAction],
	);
	const { table } = useDataTable({
		data,
		columns,
		pageCount: 1,
		// initialState: {
		// 	sorting: [{ id: 'title', desc: true }],
		// 	columnPinning: { right: ['actions'] },
		// },
		// getRowId: row => row.id,
	});
	return (
		<DataTable table={table}>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
