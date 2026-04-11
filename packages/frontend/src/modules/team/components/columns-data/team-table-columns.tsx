import { DataTableColumnHeader } from '@/shared/components/data-table/data-table-column-header';
import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { type ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { EllipsisVertical } from 'lucide-react';
import { TeamUser } from '../../interfaces/team-user.interface';

interface GetTeamTableColumnsProps {
	t: TFunction;
	onEdit: (user: TeamUser) => void;
	onBlock: (user: TeamUser) => void;
}

const roleBadgeClass: Record<TeamUser['role'], string> = {
	ADMIN: 'bg-red-100 text-red-700 border-red-200',
	MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
	MECHANIC: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusBadgeClass: Record<TeamUser['accountStatus'], string> = {
	ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	PENDING_CONFIRMATION: 'bg-amber-100 text-amber-700 border-amber-200',
	BLOCKED: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export function getTeamTableColumns({
	t,
	onEdit,
	onBlock,
}: GetTeamTableColumnsProps): ColumnDef<TeamUser>[] {
	return [
		{
			id: 'fullName',
			accessorKey: 'fullName',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('team.columns.fullName')}
				/>
			),
			cell: ({ row }) => (
				<div className='font-medium'>{row.original.fullName}</div>
			),
			meta: {
				label: t('team.columns.fullName'),
				placeholder: t('team.columns.fullName'),
				variant: 'text',
			},
			enableColumnFilter: true,
			enableHiding: false,
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label={t('common.email')} />
			),
		},
		{
			id: 'role',
			accessorKey: 'role',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label={t('team.columns.role')} />
			),
			cell: ({ row }) => (
				<Badge className={roleBadgeClass[row.original.role]} variant='outline'>
					{row.original.role}
				</Badge>
			),
		},
		{
			id: 'accountStatus',
			accessorKey: 'accountStatus',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label={t('common.status')} />
			),
			cell: ({ row }) => (
				<Badge
					className={statusBadgeClass[row.original.accountStatus]}
					variant='outline'
				>
					{t(`team.status.${row.original.accountStatus}`)}
				</Badge>
			),
			enableSorting: false,
		},
		{
			id: 'createdAt',
			accessorKey: 'createdAt',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('team.columns.createdAt')}
				/>
			),
			cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
		},
		{
			id: 'openOrdersCount',
			accessorKey: 'openOrdersCount',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('team.columns.openOrders')}
				/>
			),
			enableSorting: false,
		},
		{
			id: 'actions',
			header: () => <div className='text-right' />,
			cell: ({ row }) => (
				<div className='flex justify-end'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon'>
								<EllipsisVertical className='size-4' aria-hidden='true' />
								<span className='sr-only'>Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem
								disabled={row.original.isSelf}
								onClick={() => onEdit(row.original)}
							>
								{t('common.edit')}
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={
									row.original.isSelf ||
									row.original.accountStatus === 'BLOCKED'
								}
								onClick={() => onBlock(row.original)}
								className='text-destructive focus:text-destructive'
							>
								{t('team.actions.block')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
			size: 32,
		},
	];
}
