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
}

export function getClientTableColumns({
	setRowAction,
}: GetClientTableColumnsProps): ColumnDef<Client>[] {
	return [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					aria-label='Select all'
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
					aria-label='Select row'
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
				<DataTableColumnHeader column={column} label='Client' />
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
				<DataTableColumnHeader column={column} label='Full Name' />
			),
			meta: {
				label: 'Full Name',
				placeholder: 'Search full name...',
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
				<DataTableColumnHeader column={column} label='Email' />
			),
			meta: {
				label: 'Email',
				placeholder: 'Search email...',
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
				<DataTableColumnHeader column={column} label='Phone' />
			),
			meta: {
				label: 'Phone',
				placeholder: 'Search phone...',
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
				<DataTableColumnHeader column={column} label='Contacts' />
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
				label: 'Contacts',
			},
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			id: 'vehicleCount',
			accessorKey: 'vehicleCount',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Vehicle Count' />
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
				label: 'Vehicle Count',
				variant: 'number',
			},

			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'totalOrders',
			accessorKey: 'totalOrders',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Orders' />
			),
			meta: {
				label: 'Orders',
				variant: 'number',
			},
			enableColumnFilter: true,
		},
		{
			id: 'totalSpent',
			accessorKey: 'totalSpent',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Total Spent' />
			),
			cell: ({ cell }) => {
				const totalSpent = cell.getValue<number>();
				return <div className='font-medium'>${totalSpent}</div>;
			},

			meta: {
				label: 'Total Spent',
				variant: 'number',
			},
			enableColumnFilter: true,
		},
		{
			id: 'latestVisit',
			accessorKey: 'latestVisit',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Latest Visit' />
			),
			cell: ({ cell }) => formatDate(cell.getValue<Date>()),
			meta: {
				label: 'Latest Visit',
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
								aria-label='Open menu'
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
								View
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className=' h-4 w-4' />
								Edit
							</DropdownMenuItem>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'delete' })}
							>
								<Trash2 className='h-4 w-4' />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 40,
		},
	];
}
