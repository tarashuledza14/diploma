import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	getClientInitials,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, EllipsisVertical, Eye, Trash2 } from 'lucide-react';
import { OrderListItem } from '../../interfaces/order.interface';

interface GetOrdersTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<OrderListItem> | null>
	>;
}

export function getOrdersTableColumns({
	setRowAction,
}: GetOrdersTableColumnsProps): ColumnDef<OrderListItem>[] {
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
			id: 'client',
			accessorFn: row => row.client.fullName,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Client' />
			),
			cell: ({ row }) => {
				const fullName = row.original.client.fullName;
				const initials = getClientInitials(fullName);
				return (
					<div className='flex items-center gap-2'>
						<Avatar>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<p>{fullName}</p>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: 'Client',
				placeholder: 'Search client...',
				variant: 'text',
			},
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
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: 'Vehicle',
				placeholder: 'Search vehicle...',
				variant: 'text',
			},
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
			enableHiding: true,
		},
		// {
		// 	id: 'barcode',
		// 	accessorKey: 'barcode',
		// 	meta: {
		// 		label: 'Barcode',
		// 		placeholder: 'Search barcode...',
		// 		variant: 'text',
		// 	},
		// 	enableColumnFilter: true,
		// 	enableSorting: true,
		// 	enableHiding: true,
		// },
		// {
		// 	id: 'brand',
		// 	accessorKey: 'brand.name',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Brand' />
		// 	),
		// 	cell: ({ cell }) => <Badge>{cell.getValue<string>()}</Badge>,
		// 	enableSorting: true,
		// 	enableColumnFilter: true,
		// 	enableHiding: true,
		// 	meta: {
		// 		label: 'Brand',
		// 		variant: 'multiSelect',
		// 		options:
		// 			dictionaries?.brands.map(brand => ({
		// 				value: brand.name,
		// 				label: brand.name,
		// 			})) ?? [],
		// 	},
		// },
		// {
		// 	id: 'location',
		// 	// Збираємо унікальні локації з усіх партій на складі для пошуку/сортування
		// 	accessorFn: row => {
		// 		const locations =
		// 			row.inventory?.map(i => i.location).filter(Boolean) || [];
		// 		return Array.from(new Set(locations)).join(', ');
		// 	},
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Location' />
		// 	),
		// 	cell: ({ cell }) => {
		// 		const value = cell.getValue<string>();
		// 		return (
		// 			<span>
		// 				<MapPin className='size-5 mr-1 inline-block text-muted-foreground' />
		// 				{value || '—'}
		// 			</span>
		// 		);
		// 	},
		// 	enableSorting: true,
		// 	enableColumnFilter: true,
		// 	enableHiding: true,
		// 	meta: {
		// 		label: 'Location',
		// 		variant: 'text',
		// 	},
		// },
		// {
		// 	id: 'stock',
		// 	// Вираховуємо загальну кількість для правильного сортування
		// 	accessorFn: row =>
		// 		row.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0,
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Stock' />
		// 	),
		// 	cell: ({ row }) => {
		// 		const minStock = row.original.minStock || 1;
		// 		const totalQuantity =
		// 			row.original.inventory?.reduce(
		// 				(sum, item) => sum + item.quantity,
		// 				0,
		// 			) || 0;

		// 		const stockPercent = Math.min(
		// 			(totalQuantity / (minStock * 2)) * 100,
		// 			100,
		// 		);

		// 		return (
		// 			<div className='w-28 space-y-1'>
		// 				<div className='flex justify-between text-xs'>
		// 					<span>
		// 						{totalQuantity} {row.original.unit || 'шт'}
		// 					</span>
		// 				</div>
		// 				<Progress
		// 					value={stockPercent}
		// 					className={`h-1.5 ${totalQuantity === 0 ? '[&>div]:bg-red-500' : totalQuantity < minStock ? '[&>div]:bg-amber-500' : ''}`}
		// 				/>
		// 			</div>
		// 		);
		// 	},
		// 	enableSorting: true,
		// 	enableColumnFilter: true,
		// 	enableHiding: true,
		// 	meta: {
		// 		label: 'Stock',
		// 		variant: 'number',
		// 	},
		// },
		// {
		// 	id: 'supplier',
		// 	accessorKey: 'supplier.name',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Supplier' />
		// 	),
		// 	cell: ({ cell }) => <span>{cell.getValue<string>() || '—'}</span>,
		// 	enableSorting: true,
		// 	enableColumnFilter: true,
		// 	enableHiding: true,
		// 	meta: {
		// 		label: 'Supplier',
		// 		variant: 'multiSelect',
		// 		options: dictionaries?.suppliers.map(supplier => ({
		// 			value: supplier.name,
		// 			label: supplier.name,
		// 		})) ?? [{ value: 'Unknown', label: 'Unknown' }],
		// 	},
		// },
		// {
		// 	id: 'retailPrice',
		// 	// Шукаємо роздрібну ціну для сортування
		// 	accessorFn: row => {
		// 		const retailRule =
		// 			row.priceRules?.find(r => r.clientType === 'RETAIL') ||
		// 			row.priceRules?.[0];
		// 		return retailRule?.fixedPrice ? Number(retailRule.fixedPrice) : 0;
		// 	},
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Price' />
		// 	),
		// 	cell: ({ row }) => {
		// 		// Беремо роздрібну ціну
		// 		const retailRule =
		// 			row.original.priceRules?.find(r => r.clientType === 'RETAIL') ||
		// 			row.original.priceRules?.[0];
		// 		const retailPrice = retailRule?.fixedPrice;
		// 		const markup = retailRule?.markupPercent;

		// 		// Беремо закупівельну ціну з останньої партії
		// 		const latestInventory = row.original.inventory?.[0];
		// 		const purchasePrice = latestInventory?.purchasePrice;

		// 		const formatPrice = (value: unknown) => {
		// 			if (value == null) return '—';
		// 			const num = typeof value === 'number' ? value : Number(value);
		// 			return !isNaN(num) ? `$${num.toFixed(2)}` : '—';
		// 		};

		// 		return (
		// 			<div>
		// 				<p className='font-medium'>
		// 					{retailPrice != null ? (
		// 						formatPrice(retailPrice)
		// 					) : (
		// 						<span className='text-muted-foreground'>—</span>
		// 					)}
		// 				</p>

		// 				<p className='text-xs text-muted-foreground'>
		// 					{purchasePrice != null ? formatPrice(purchasePrice) : '—'}
		// 					{markup ? ` (+${markup}%)` : ''}
		// 				</p>
		// 			</div>
		// 		);
		// 	},
		// 	enableSorting: true,
		// 	enableColumnFilter: true,
		// 	enableHiding: true,
		// 	meta: {
		// 		label: 'Price',
		// 		variant: 'number',
		// 	},
		// },
		{
			id: 'status',
			accessorKey: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Status' />
			),
			cell: ({ row }) => (
				<Badge variant='secondary'>
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
				<Badge variant='outline'>
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
				return d ? new Date(d).toLocaleDateString() : '—';
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
				<DataTableColumnHeader column={column} label='Total' className='text-right' />
			),
			cell: ({ row }) => (
				<div className='text-right font-medium'>
					{row.original.totalAmount}
				</div>
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
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'view' })}
							>
								<Eye className='h-4 w-4 mr-2' />
								View
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className='h-4 w-4 mr-2' />
								Edit
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className='text-destructive'
								onSelect={() => setRowAction({ row, variant: 'delete' })}
							>
								<Trash2 className='h-4 w-4 mr-2' />
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
