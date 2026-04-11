import { DataTable, DataTableToolbar, useDataTable } from '@/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamUser } from '../interfaces/team-user.interface';
import { getTeamTableColumns } from './columns-data/team-table-columns';

interface TeamTableProps {
	data: TeamUser[];
	pageCount: number;
	onEdit: (user: TeamUser) => void;
	onBlock: (user: TeamUser) => void;
	isLoading?: boolean;
}

export function TeamTable({
	data,
	pageCount,
	onEdit,
	onBlock,
	isLoading,
}: TeamTableProps) {
	const { t, i18n } = useTranslation();

	const columns = useMemo(
		() => getTeamTableColumns({ t, onEdit, onBlock }),
		[t, onEdit, onBlock, i18n.resolvedLanguage],
	);

	const { table } = useDataTable<TeamUser>({
		data,
		columns,
		pageCount,
		initialState: {
			sorting: [{ id: 'createdAt', desc: true }],
			columnPinning: { right: ['actions'] },
		},
		getRowId: row => row.id,
		shallow: false,
		clearOnDefault: true,
	});

	if (isLoading && data.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
		);
	}

	return (
		<DataTable table={table}>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
