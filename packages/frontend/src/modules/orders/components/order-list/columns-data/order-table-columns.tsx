import { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { formatDate, getClientInitials } from '@/shared';
import { DataTableColumnHeader } from '@/shared/components/data-table';
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, EllipsisVertical, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatOrderNumber } from '../../../utils/format-order-number';

interface GetOrderTableColumnsProps {
	setRowAction?: React.Dispatch<
		React.SetStateAction<DataTableRowAction<OrderListItem> | null>
	>;
	statusColors: Record<string, string>;
	priorityColors: Record<string, string>;
}

export function getOrderTableColumns({
	setRowAction,
	statusColors,
	priorityColors,
}: GetOrderTableColumnsProps): ColumnDef<OrderListItem>[] {
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
			id: 'orderNumber',
			accessorKey: 'orderNumber',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Order' />
			),
			cell: ({ row }) => (
				<div className='font-medium'>
					{formatOrderNumber(row.original.orderNumber)}
				</div>
			),
			meta: {
				label: 'Order',
				placeholder: 'Search order number...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'client',
			accessorFn: row => row.client.fullName,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Client' />
			),
			cell: ({ row }) => {
				const fullName = row.original.client.fullName;
				return (
					<div className='flex items-center gap-2'>
						<Avatar>
							<AvatarFallback>{getClientInitials(fullName)}</AvatarFallback>
						</Avatar>
						<span>{fullName}</span>
					</div>
				);
			},
			meta: {
				label: 'Client',
				placeholder: 'Search client...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'vehicle',
			accessorFn: row =>
				`${row.vehicle.year} ${row.vehicle.brand} ${row.vehicle.model}`,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Vehicle' />
			),
			cell: ({ row }) => {
				const v = row.original.vehicle;
				return (
					<div>
						<p className='font-medium'>
							{v.year} {v.brand} {v.model}
						</p>
						<p className='text-xs text-muted-foreground'>
							{v.plateNumber || v.color || '—'}
						</p>
					</div>
				);
			},
			meta: {
				label: 'Vehicle',
				placeholder: 'Search vehicle...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'services',
			accessorFn: row => row.services.map(s => s.name).join(', '),
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Services' />
			),
			cell: ({ row }) => (
				<div className='flex flex-wrap gap-1'>
					{row.original.services.slice(0, 2).map(s => (
						<Badge key={s.id} variant='secondary' className='text-xs'>
							{s.name}
						</Badge>
					))}
					{row.original.services.length > 2 && (
						<Badge variant='secondary' className='text-xs'>
							+{row.original.services.length - 2}
						</Badge>
					)}
				</div>
			),
			meta: {
				label: 'Services',
				placeholder: 'Search services...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Status' />
			),
			cell: ({ row }) => (
				<Badge className={cn(statusColors[String(row.original.status)])}>
					{String(row.original.status).replace(/_/g, ' ')}
				</Badge>
			),
			meta: {
				label: 'Status',
				placeholder: 'Filter by status...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'priority',
			accessorKey: 'priority',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Priority' />
			),
			cell: ({ row }) => (
				<Badge
					variant='outline'
					className={cn(priorityColors[String(row.original.priority)])}
				>
					{String(row.original.priority)}
				</Badge>
			),
			meta: {
				label: 'Priority',
				placeholder: 'Filter by priority...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'endDate',
			accessorKey: 'endDate',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='End Date' />
			),
			cell: ({ row }) => {
				const d = row.original.endDate;
				return d ? formatDate(d) : '—';
			},
			meta: {
				label: 'End Date',
				variant: 'date',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'totalAmount',
			accessorKey: 'totalAmount',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label='Total'
					className='text-right'
				/>
			),
			cell: ({ row }) => (
				<div className='font-medium'>{row.original.totalAmount}</div>
			),
			meta: {
				label: 'Total',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
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
							<DropdownMenuItem asChild>
								<Link to={`/orders/${row.original.id}`}>
									<Eye className='mr-2 h-4 w-4' />
									View Details
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction?.({ row, variant: 'update' })}
							>
								<Edit className='mr-2 h-4 w-4' />
								Edit Order
							</DropdownMenuItem>
							<DropdownMenuItem
								className='text-destructive'
								onSelect={() => setRowAction?.({ row, variant: 'delete' })}
							>
								<Trash2 className='mr-2 h-4 w-4' />
								Delete Order
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 40,
		},
	];
}
