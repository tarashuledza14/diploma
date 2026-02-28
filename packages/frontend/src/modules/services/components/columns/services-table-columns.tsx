import {
	Badge,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react';
import {
	Service,
	ServiceDictionaries,
} from '../../interfaces/services.interface';

interface GetServicesTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<Service> | null>
	>;
	dictionaries: ServiceDictionaries | undefined;
}
export function getServicesTableColumns({
	setRowAction,
	dictionaries,
}: GetServicesTableColumnsProps): ColumnDef<Service>[] {
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
				<DataTableColumnHeader column={column} label='Name' />
			),
			cell: ({ row }) => (
				<div>
					<div className='font-medium'>{row.original.name}</div>
					{row.original.description && (
						<div className='text-xs text-muted-foreground'>
							{row.original.description}
						</div>
					)}
				</div>
			),
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: 'Name',
			},
		},
		{
			id: 'category.id',
			accessorKey: 'category.id',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Category' />
			),
			cell: ({ row }) => {
				const category = row.original.category;
				return category ? (
					<Badge variant='outline'>{category.name}</Badge>
				) : (
					<span className='text-muted-foreground'>-</span>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Category',
				variant: 'multiSelect',
				options: dictionaries?.serviceCategories.map(c => ({
					label: c.name,
					value: c.id,
				})),
			},
		},
		{
			id: 'estimatedTime',
			accessorKey: 'estimatedTime',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Labor' />
			),
			cell: ({ row }) => <div>{row.original.estimatedTime}h</div>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Labor',
				variant: 'number',
			},
		},

		{
			id: 'requiredCategories',
			accessorKey: 'requiredCategories',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Parts Included' />
			),
			cell: ({ row }) => {
				const categories = row.original.requiredCategories || [];

				if (categories.length === 0) {
					return <span className='text-muted-foreground text-sm'>-</span>;
				}

				const maxVisible = 2;
				const visibleCategories = categories.slice(0, maxVisible);
				const hiddenCount = categories.length - maxVisible;

				return (
					<div className='flex flex-wrap items-center gap-1'>
						{visibleCategories.map(c => (
							<Badge
								key={c.id}
								className='bg-white text-black hover:bg-gray-100'
							>
								{c.name}
							</Badge>
						))}
						{hiddenCount > 0 && (
							<Popover>
								<PopoverTrigger asChild>
									<Badge
										variant='secondary'
										className='cursor-pointer hover:bg-secondary/80'
									>
										+{hiddenCount}
									</Badge>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto max-w-[min(90vw,18rem)] p-3'
									align='start'
								>
									<div className='flex flex-wrap gap-1.5'>
										{categories.slice(maxVisible).map(c => (
											<Badge key={c.id} variant='outline' className='text-xs'>
												{c.name}
											</Badge>
										))}
									</div>
								</PopoverContent>
							</Popover>
						)}
					</div>
				);
			},
			meta: {
				label: 'Parts Included',
				variant: 'multiSelect',
				options: dictionaries?.partCategories.map(c => ({
					label: c.name,
					value: c.id,
				})) || [{ label: 'No categories', value: 'none' }],
			},
			enableSorting: false,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'price',
			accessorKey: 'price',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Price' />
			),
			cell: ({ row }) => {
				const retail = row.original.price;
				return <div className='font-medium'>${retail}</div>;
			},
			meta: {
				label: 'Price',
				variant: 'number',
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
		},
		{
			id: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label='Status' />
			),
			cell: ({ row }) => {
				const status = row.original.status ? 'Active' : 'Inactive';

				return (
					<Badge variant={status === 'Active' ? 'default' : 'secondary'}>
						{status}
					</Badge>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: 'Status',
				variant: 'boolean',
				options: [
					{ label: 'Active', value: 'true' },
					{ label: 'Inactive', value: 'false' },
				],
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
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className=' h-4 w-4' />
								Edit
							</DropdownMenuItem>

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
