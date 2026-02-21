import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import {
	Badge,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Progress,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, EllipsisVertical, Eye, MapPin, Trash2 } from 'lucide-react';

interface GetInventoryTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<InventoryPart> | null>
	>;
	dictionaries?: InventoryDictionaries;
}

export function getInventoryTableColumns({
	setRowAction,
	dictionaries,
}: GetInventoryTableColumnsProps): ColumnDef<InventoryPart>[] {
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
			id: 'name',
			accessorKey: 'name',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Part' />
			),
			cell: ({ row }) => (
				<div>
					<p className='font-medium'>{row.original.name}</p>
					<p className='text-xs text-muted-foreground'>
						{row.original.barcode || 'No barcode'} |{' '}
						{row.original.oem || 'No OEM'}
					</p>
				</div>
			),
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: 'Part',
				variant: 'text',
			},
		},
		{
			id: 'oem',
			accessorKey: 'oem',
			meta: {
				label: 'OEM',
				placeholder: 'Search OEM...',
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'barcode',
			accessorKey: 'barcode',
			meta: {
				label: 'Barcode',
				placeholder: 'Search barcode...',
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'brand',
			accessorKey: 'brand.name',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Brand' />
			),
			cell: ({ cell }) => <Badge>{cell.getValue<string>()}</Badge>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Brand',
				variant: 'multiSelect',
				options:
					dictionaries?.brands.map(brand => ({
						value: brand.name,
						label: brand.name,
					})) ?? [],
			},
		},
		{
			id: 'location',
			accessorKey: 'location',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Location' />
			),
			cell: ({ cell }) => (
				<span>
					<MapPin className='size-5 mr-1 inline-block' />
					{cell.getValue<string>()}
				</span>
			),
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Location',
				variant: 'text',
			},
		},
		{
			id: 'stock',
			accessorKey: 'stock',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Stock' />
			),
			cell: ({ row }) => {
				const minStock = row.original.minStock || 1;
				const stockPercent = Math.min(
					(row.original.quantityAvailable / (minStock * 2)) * 100,
					100,
				);

				return (
					<div className='w-28 space-y-1'>
						<div className='flex justify-between text-xs'>
							<span>
								{row.original.quantityAvailable} {row.original.unit}
							</span>
							{row.original.quantityReserved > 0 && (
								<span className='text-amber-600'>
									({row.original.quantityReserved} res.)
								</span>
							)}
						</div>
						<Progress
							value={stockPercent}
							className={`h-1.5 ${row.original.quantityAvailable === 0 ? '[&>div]:bg-red-500' : row.original.quantityAvailable < minStock ? '[&>div]:bg-amber-500' : ''}`}
						/>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Stock',
				variant: 'number',
			},
		},
		{
			id: 'supplier',
			accessorKey: 'supplier.name',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Supplier' />
			),
			cell: ({ cell }) => <span>{cell.getValue<string>()}</span>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Supplier',
				variant: 'multiSelect',
				options: dictionaries?.suppliers.map(supplier => ({
					value: supplier.name,
					label: supplier.name,
				})) ?? [{ value: 'Unknown', label: 'Unknown' }],
			},
		},
		{
			id: 'retailPrice',
			accessorKey: 'price',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Price' />
			),
			cell: ({ row }) => {
				const retail = row.original.retailPrice;
				const purchase = row.original.purchasePrice;

				const formatPrice = (value: unknown) => {
					const num = typeof value === 'number' ? value : Number(value);
					return !isNaN(num) ? `$${num.toFixed(2)}` : '—';
				};

				return (
					<div>
						<p className='font-medium'>
							{retail != null && !isNaN(Number(retail)) ? (
								formatPrice(retail)
							) : (
								<span className='text-muted-foreground'>—</span>
							)}
						</p>

						<p className='text-xs text-muted-foreground'>
							{purchase != null && !isNaN(Number(purchase))
								? formatPrice(purchase)
								: '—'}
							{row.original.markup ? ` (+${row.original.markup}%)` : ''}
						</p>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Price',
				variant: 'number',
			},
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

		// 	enableColumnFilter: true,
		// 	enableSorting: true,
		// 	enableHiding: true,
		// },
		// {
		// 	id: 'mileage',
		// 	accessorKey: 'mileage',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Mileage' />
		// 	),
		// 	cell: ({ cell }) => {
		// 		return (
		// 			<div className='flex items-center gap-1'>
		// 				{cell.getValue<number>()} km
		// 			</div>
		// 		);
		// 	},
		// 	meta: {
		// 		label: 'Mileage',
		// 		variant: 'number',
		// 	},
		// 	enableColumnFilter: true,
		// 	enableSorting: true,
		// },
		// {
		// 	id: 'totalServices',
		// 	accessorKey: 'totalServices',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Services' />
		// 	),
		// 	cell: ({ cell }) => {
		// 		return (
		// 			<div className='flex items-center gap-1'>
		// 				<Wrench className='h-4 w-4 text-muted-foreground' />
		// 				{cell.getValue<number>()}
		// 			</div>
		// 		);
		// 	},
		// 	meta: {
		// 		label: 'Services',
		// 		variant: 'number',
		// 	},

		// 	enableColumnFilter: true,
		// 	enableSorting: true,
		// },
		// {
		// 	id: 'lastService',
		// 	accessorKey: 'lastService',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Last Service' />
		// 	),
		// 	cell: ({ cell }) => formatDate(cell.getValue<Date>()),
		// 	meta: {
		// 		label: 'Last Service',
		// 		variant: 'date',
		// 	},
		// 	enableColumnFilter: true,
		// },

		// {
		// 	id: 'status',
		// 	accessorKey: 'status',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Status' />
		// 	),
		// 	cell: ({ cell }) => {
		// 		const value = cell.getValue<VehicleStatus>();
		// 		const statusInfo = vehicleStatusInfo[value] || {
		// 			label: value,
		// 			variant: 'default' as const,
		// 		};

		// 		return (
		// 			<Status variant={statusInfo.variant}>
		// 				<StatusLabel>{statusInfo.label}</StatusLabel>
		// 			</Status>
		// 		);
		// 	},
		// 	enableColumnFilter: true,
		// 	enableSorting: true,
		// 	meta: {
		// 		label: 'Status',
		// 		placeholder: 'Filter by status...',
		// 		variant: 'multiSelect',
		// 		options: Object.entries(vehicleStatusInfo).map(([value, info]) => ({
		// 			value: value as string,
		// 			label: `${info.label}	`,
		// 			variant: info.variant,
		// 			count: statusCounts?.[value as unknown as VehicleStatus] || 0,
		// 		})),
		// 	},
		// },
	];
}
