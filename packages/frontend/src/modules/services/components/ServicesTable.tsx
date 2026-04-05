import {
	DataTable,
	DataTableAdvancedToolbar,
	DataTableFilterList,
	DataTableSortList,
	useDataTable,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServicesService } from '../api/services.service';
import { Service } from '../interfaces/services.interface';
import { serviceKeys } from '../queries/keys';
import { DeleteConfirmServiceModal } from './DeleteConfirmServiceModal';
import { EditServiceDialog } from './EditServiceDialog';
import { ServicesTableActionBar } from './ServicesTableActionBar';
import { getServicesTableColumns } from './columns/services-table-columns';

interface ServiceTableProps {
	data: Service[];
	pageCount: number;
}
export function ServiceTable({ data, pageCount }: ServiceTableProps) {
	const { t, i18n } = useTranslation();
	const { data: dictionaries } = useSuspenseQuery({
		queryKey: serviceKeys.categories(),
		queryFn: () => ServicesService.getDictionaries(),
		staleTime: Infinity,
	});
	const [rowAction, setRowAction] =
		useState<DataTableRowAction<Service> | null>(null);

	const columns = useMemo(
		() => getServicesTableColumns({ setRowAction, dictionaries, t }),
		[setRowAction, dictionaries, t, i18n.resolvedLanguage],
	);

	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount,
		initialState: {
			sorting: [{ id: 'name', desc: true }],
			columnPinning: { right: ['actions'] },
		},
		getRowId: row => row.id,
	});

	return (
		<>
			<DataTable
				table={table}
				actionBar={<ServicesTableActionBar table={table} />}
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

			<EditServiceDialog
				open={!!rowAction && rowAction.variant === 'update'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				service={rowAction?.row?.original ?? null}
				dictionaries={dictionaries}
			/>

			<DeleteConfirmServiceModal
				open={!!rowAction && rowAction.variant === 'delete'}
				onOpenChange={open => {
					if (!open) setRowAction(null);
				}}
				selectedService={rowAction?.row?.original ?? null}
			/>
		</>
	);
}
