import { getClientInitials } from '@/shared';
import { DataTableColumnHeader } from '@/shared/components/data-table/data-table-column-header';
import {
	Avatar,
	AvatarFallback,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import {
	Car,
	Edit,
	EllipsisVertical,
	Eye,
	Mail,
	Phone,
	Trash2,
} from 'lucide-react';
import React from 'react';
import { Client } from '../interfaces/client.interface';

interface GetClientTableColumnsProps {
	// statusCounts: Record<Client['status'], number>;
	// priorityCounts: Record<Client['priority'], number>;
	// estimatedHoursRange: { min: number; max: number };
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<Client> | null>
	>;
	formatCurrency: (value: number | string | null | undefined) => string;
	t: TFunction;
}

export function getClientTableColumns({
	setRowAction,
	formatCurrency,
	t,
}: GetClientTableColumnsProps): ColumnDef<Client>[] {
	return [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					aria-label={t('table.selectAll')}
					className='translate-y-0.5'
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					aria-label={t('table.selectRow')}
					className='translate-y-0.5'
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
				/>
			),
			enableHiding: false,
			enableSorting: false,
			size: 40,
		},
		{
			id: 'avatar',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.client')}
				/>
			),
			cell: ({ row }) => {
				const fullName = row.original.fullName;
				const initials = getClientInitials(fullName);
				return (
					<Avatar>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				);
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableHiding: false,
			size: 10,
		},
		{
			id: 'fullName',
			accessorKey: 'fullName',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.fullName')}
				/>
			),
			meta: {
				label: t('clients.columns.fullName'),
				placeholder: t('clients.filters.searchFullName'),
				variant: 'text',
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label={t('common.email')} />
			),
			meta: {
				label: t('common.email'),
				placeholder: t('clients.filters.searchEmail'),
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'phone',
			accessorKey: 'phone',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label={t('common.phone')} />
			),
			meta: {
				label: t('common.phone'),
				placeholder: t('clients.filters.searchPhone'),
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'contacts',
			accessorFn: row => `${row.email || ''} ${row.phone || ''}`,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.contacts')}
				/>
			),
			cell: ({ row }) => {
				const email = row.original.email;
				const phone = row.original.phone;
				return (
					<div className='space-y-1'>
						{email && (
							<div className='flex items-center gap-1 text-sm'>
								<Mail className='h-3 w-3 text-muted-foreground' />
								{email}
							</div>
						)}
						{phone && (
							<div className='flex items-center gap-1 text-sm'>
								<Phone className='h-3 w-3 text-muted-foreground' />
								{phone}
							</div>
						)}
					</div>
				);
			},
			meta: {
				label: t('clients.columns.contacts'),
			},
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			id: 'vehicleCount',
			accessorKey: 'vehicleCount',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.vehicleCount')}
				/>
			),
			cell: ({ cell }) => {
				return (
					<div className='flex items-center gap-1'>
						<Car className='h-4 w-4 text-muted-foreground' />
						{cell.getValue<number>()}
					</div>
				);
			},
			meta: {
				label: t('clients.columns.vehicleCount'),
				variant: 'number',
			},

			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'totalOrders',
			accessorKey: 'totalOrders',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.orders')}
				/>
			),
			meta: {
				label: t('clients.columns.orders'),
				variant: 'number',
			},
			enableColumnFilter: true,
		},
		{
			id: 'totalSpent',
			accessorKey: 'totalSpent',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.totalSpent')}
				/>
			),
			cell: ({ cell }) => {
				const totalSpent = cell.getValue<number>();
				return <div className='font-medium'>{formatCurrency(totalSpent)}</div>;
			},

			meta: {
				label: t('clients.columns.totalSpent'),
				variant: 'number',
			},
			enableColumnFilter: true,
		},
		{
			id: 'latestVisit',
			accessorKey: 'latestVisit',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('clients.columns.latestVisit')}
				/>
			),
			cell: ({ cell }) => formatDate(cell.getValue<Date>()),
			meta: {
				label: t('clients.columns.latestVisit'),
				variant: 'date',
			},
			enableColumnFilter: true,
		},
		{
			id: 'actions',
			cell: function Cell({ row }) {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={t('table.openMenu')}
								variant='ghost'
								className='flex size-8 p-0 data-[state=open]:bg-muted'
							>
								<EllipsisVertical className='size-4' aria-hidden='true' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-40'>
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'view' })}
							>
								<Eye className='h-4 w-4' />
								{t('common.view')}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className=' h-4 w-4' />
								{t('common.edit')}
							</DropdownMenuItem>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'delete' })}
							>
								<Trash2 className='h-4 w-4' />
								{t('common.delete')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 40,
		},
	];
}
