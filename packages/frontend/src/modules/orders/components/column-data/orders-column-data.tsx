import { InventoryDictionaries } from '@/modules/inventory/interfaces/inventory.interfaces';
import {
	Avatar,
	AvatarFallback,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	getClientInitials,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, EllipsisVertical, Eye, History, Trash2 } from 'lucide-react';
import { Order } from '../../interfaces/order.interface';

interface GetOrdersTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<Order> | null>
	>;
	dictionaries?: InventoryDictionaries;
}

export function getOrdersTableColumns({
	setRowAction,
	dictionaries,
}: GetOrdersTableColumnsProps): ColumnDef<Order>[] {
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
			accessorKey: 'client.fullName',
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
				label: 'Part',
				variant: 'text',
			},
		},
		{
			id: 'vehicle',
			accessorKey: 'vehicle',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Vehicle' />
			),
			cell: ({ row }) => {
				const { year, brand, model, color } = row.original.vehicle;
				return (
					<div>
						<p className='font-medium'>
							{year} {brand} {model}
						</p>
						<p className='text-xs text-muted-foreground'>{color}</p>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: 'Vehicle',
				variant: 'text',
			},
		},
		{
			id: 'services',
			accessorKey: 'services',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Services' />
			),
			cell: ({ row }) => {
				const { services } = row.original;
				return (
					<div className='flex flex-wrap gap-1'>
						{/* {services?.map(s => (
							// <Badge key={s}>{s.}</Badge>
						))} */}
					</div>
				);
			},
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
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className='h-4 w-4 mr-2' />
								Edit
							</DropdownMenuItem>

							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'history' })}
							>
								<History className='h-4 w-4 mr-2' />
								Movement History
							</DropdownMenuItem>
							<DropdownMenuItem
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
