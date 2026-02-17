import { Badge, Checkbox, DataTableColumnHeader } from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Service } from '../../interfaces/services.interface';

interface GetServicesTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<Service> | null>
	>;
}

	setRowAction,
}: GetServicesTableColumnsProps): ColumnDef<Service>[] {
	return [
		{
			id: 'part',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Part' />,
			accessorKey: 'name',
			cell: ({ row }) => (
				<div>
					<div className='font-medium'>{row.original.name}</div>
					<div className='text-xs text-muted-foreground'>{row.original.sku} {row.original.oem ? `| ${row.original.oem}` : ''}</div>
				</div>
			),
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
		},
		{
			id: 'brand',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Brand' />,
			accessorKey: 'brand',
			cell: ({ cell }) => <Badge>{cell.getValue<string>()}</Badge>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'location',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Location' />,
			accessorKey: 'location',
			cell: ({ cell }) => <span>{cell.getValue<string>()}</span>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'stock',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Stock' />,
			cell: ({ row }) => {
				const available = row.original.quantityAvailable;
				const reserved = row.original.quantityReserved;
				const unit = row.original.unit || 'pcs';
				return (
					<div>
						<span>{available} {unit}</span>
						{reserved > 0 && <span className='text-xs text-muted-foreground ml-2'>({reserved} res.)</span>}
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'supplier',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Supplier' />,
			accessorKey: 'supplier',
			cell: ({ cell }) => <span>{cell.getValue<string>()}</span>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'price',
			header: ({ column }) => <DataTableColumnHeader column={column} label='Price' />,
			cell: ({ row }) => {
				const retail = row.original.retailPrice;
				const purchase = row.original.purchasePrice;
				const markup = row.original.markup;
				return (
					<div>
						<div className='font-medium'>${retail?.toFixed(2)}</div>
						<div className='text-xs text-muted-foreground'>${purchase?.toFixed(2)}{markup ? ` (+${markup}%)` : ''}</div>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
	];
		// {
		// 	id: '',
		// 	accessorKey: '',
		// 	meta: {
		// 		label: 'Model',
		// 		placeholder: 'Search model...',
		// 		variant: 'text',
		// 	},
		// 	enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
		// 	enableSorting: true,
		// 	enableHiding: true, // Дозволяємо приховувати
		// },
		// {
		// 	id: 'year',
		// 	accessorKey: 'year',
		// 	meta: {
		// 		label: 'Year',
		// 		placeholder: 'Search year...',
		// 		variant: 'number',
		// 	},
		// 	enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
		// 	enableSorting: true,
		// 	enableHiding: true, // Дозволяємо приховувати
		// },
		// {
		// 	id: 'vin',
		// 	accessorKey: 'vin',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Plate / VIN' />
		// 	),
		// 	meta: {
		// 		label: 'Plate / VIN',
		// 		placeholder: 'Search Plate / VIN...',
		// 		variant: 'text',
		// 	},
		// 	enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
		// 	enableSorting: true,
		// 	enableHiding: true, // Дозволяємо приховувати
		// },
		// {
		// 	id: 'owner.fullName',
		// 	accessorFn: row => row.owner.fullName,
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} label='Owner' />
		// 	),
		// 	cell: ({ cell }) => {
		// 		const ownerName = cell.getValue<string>();
		// 		return (
		// 			<div className='font-medium flex items-center gap-2 '>
		// 				<Avatar>
		// 					<AvatarFallback>{getClientInitials(ownerName)}</AvatarFallback>
		// 				</Avatar>
		// 				{ownerName}
		// 			</div>
		// 		);
		// 	},
		// 	meta: {
		// 		label: 'Owner',
		// 		placeholder: 'Search owner...',
		// 		variant: 'text',
		// 	},
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
		// {
		// 	id: 'actions',
		// 	cell: function Cell({ row }) {
		// 		return (
		// 			<DropdownMenu>
		// 				<DropdownMenuTrigger asChild>
		// 					<Button
		// 						aria-label='Open menu'
		// 						variant='ghost'
		// 						className='flex size-8 p-0 data-[state=open]:bg-muted'
		// 					>
		// 						<EllipsisVertical className='size-4' aria-hidden='true' />
		// 					</Button>
		// 				</DropdownMenuTrigger>
		// 				<DropdownMenuContent align='end' className='w-40'>
		// 					<DropdownMenuItem
		// 						onSelect={() => setRowAction({ row, variant: 'view' })}
		// 					>
		// 						<Eye className='h-4 w-4' />
		// 						View
		// 					</DropdownMenuItem>
		// 					<DropdownMenuSeparator />
		// 					<DropdownMenuItem
		// 						onSelect={() => setRowAction({ row, variant: 'update' })}
		// 					>
		// 						<Edit className=' h-4 w-4' />
		// 						Edit
		// 					</DropdownMenuItem>

		// 					<DropdownMenuSeparator />
		// 					<DropdownMenuItem
		// 						onSelect={() => setRowAction({ row, variant: 'delete' })}
		// 					>
		// 						<Trash2 className='h-4 w-4' />
		// 						Delete
		// 					</DropdownMenuItem>
		// 				</DropdownMenuContent>
		// 			</DropdownMenu>
		// 		);
		// 	},
		// 	size: 40,
		// },
	];
}
