import {
	Avatar,
	AvatarFallback,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Status,
	StatusLabel,
	formatDate,
	getClientInitials,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Car, Edit, EllipsisVertical, Eye, Trash2, Wrench } from 'lucide-react';
import { vehicleStatusInfo } from '../../constants/vehicle-status.constans';
import { VehicleStatus } from '../../enums/vehicle-status.enum';
import { VehicleWithOwnerInfo } from '../../interfaces/get-vehicle.interface';
import { StatusCounts } from '../../interfaces/status-counts.interface';

interface GetVehicleTableColumnsProps {
	statusCounts?: StatusCounts;
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<VehicleWithOwnerInfo> | null>
	>;
}

export function getVehicleTableColumns({
	setRowAction,
	statusCounts,
}: GetVehicleTableColumnsProps): ColumnDef<VehicleWithOwnerInfo>[] {
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
				<DataTableColumnHeader column={column} label='Vehicle' />
			),
			cell: () => {
				return (
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
						<Car className='h-5 w-5 text-muted-foreground' />
					</div>
				);
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableHiding: false,
			size: 10,
		},
		{
			id: 'data',
			accessorFn: row => `${row.year} ${row.brand} ${row.model} ${row.color}`,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='' />
			),
			cell: ({ row }) => {
				const { year, brand, model, color } = row.original;
				return (
					<div>
						<p className='font-medium'>
							{year} {brand} {model}
						</p>
						<p className='text-xs text-muted-foreground'>{color}</p>
					</div>
				);
			},
			meta: {
				label: 'data',
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableHiding: false,
		},
		{
			id: 'brand',
			accessorKey: 'brand',
			meta: {
				label: 'Brand',
				placeholder: 'Search brand...',
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'model',
			accessorKey: 'model',
			meta: {
				label: 'Model',
				placeholder: 'Search model...',
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'year',
			accessorKey: 'year',
			meta: {
				label: 'Year',
				placeholder: 'Search year...',
				variant: 'number',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'vin',
			accessorKey: 'vin',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Plate / VIN' />
			),
			meta: {
				label: 'Plate / VIN',
				placeholder: 'Search Plate / VIN...',
				variant: 'text',
			},
			enableColumnFilter: true, // Вмикаємо, щоб з'явилось у списку фільтрів
			enableSorting: true,
			enableHiding: true, // Дозволяємо приховувати
		},
		{
			id: 'owner.fullName',
			accessorFn: row => row.owner.fullName,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Owner' />
			),
			cell: ({ cell }) => {
				const ownerName = cell.getValue<string>();
				return (
					<div className='font-medium flex items-center gap-2 '>
						<Avatar>
							<AvatarFallback>{getClientInitials(ownerName)}</AvatarFallback>
						</Avatar>
						{ownerName}
					</div>
				);
			},
			meta: {
				label: 'Owner',
				placeholder: 'Search owner...',
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'mileage',
			accessorKey: 'mileage',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Mileage' />
			),
			cell: ({ cell }) => {
				return (
					<div className='flex items-center gap-1'>
						{cell.getValue<number>()} km
					</div>
				);
			},
			meta: {
				label: 'Mileage',
				variant: 'number',
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'totalServices',
			accessorKey: 'totalServices',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Services' />
			),
			cell: ({ cell }) => {
				return (
					<div className='flex items-center gap-1'>
						<Wrench className='h-4 w-4 text-muted-foreground' />
						{cell.getValue<number>()}
					</div>
				);
			},
			meta: {
				label: 'Services',
				variant: 'number',
			},

			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: 'lastService',
			accessorKey: 'lastService',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Last Service' />
			),
			cell: ({ cell }) => formatDate(cell.getValue<Date>()),
			meta: {
				label: 'Last Service',
				variant: 'date',
			},
			enableColumnFilter: true,
		},

		{
			id: 'status',
			accessorKey: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Status' />
			),
			cell: ({ cell }) => {
				const value = cell.getValue<VehicleStatus>();
				const statusInfo = vehicleStatusInfo[value] || {
					label: value,
					variant: 'default' as const,
				};

				return (
					<Status variant={statusInfo.variant}>
						<StatusLabel>{statusInfo.label}</StatusLabel>
					</Status>
				);
			},
			enableColumnFilter: true,
			enableSorting: true,
			meta: {
				label: 'Status',
				placeholder: 'Filter by status...',
				variant: 'multiSelect',
				options: Object.entries(vehicleStatusInfo).map(([value, info]) => ({
					value: value as string,
					label: `${info.label}	`,
					variant: info.variant,
					count: statusCounts?.[value as unknown as VehicleStatus] || 0,
				})),
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
	];
}
