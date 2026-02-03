import { DataTableColumnHeader } from '@/shared/components/data-table/data-table-column-header';
import { Checkbox } from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { Car, CircleDashed, Mail, Phone } from 'lucide-react';
import { Client } from '../clients/interfaces/client.interface';

// interface GetClientTableColumnsProps {
// 	// statusCounts: Record<Client['status'], number>;
// 	// priorityCounts: Record<Client['priority'], number>;
// 	estimatedHoursRange: { min: number; max: number };
// 	setRowAction: React.Dispatch<
// 		React.SetStateAction<DataTableRowAction<Client> | null>
// 	>;
// }

export function getClientTableColumns(): ColumnDef<Client>[] {
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
						<div className='flex items-center gap-1 text-sm'>
							<Mail className='h-3 w-3 text-muted-foreground' />
							{email}
						</div>
						<div className='flex items-center gap-1 text-sm'>
							<Phone className='h-3 w-3 text-muted-foreground' />
							{phone}
						</div>
					</div>
				);
			},
			meta: {
				label: 'Contacts',
				placeholder: 'Search contacts...',
				variant: 'text',
			},
			enableColumnFilter: true,
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
				// variant: 'multiSelect',
				// options: tasks.status.enumValues.map(status => ({
				// 	label: status.charAt(0).toUpperCase() + status.slice(1),
				// 	value: status,
				// 	count: statusCounts[status],
				// 	icon: getStatusIcon(status),
				// })),
				icon: CircleDashed,
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
			// cell: ({ cell }) => {
			// 	const priority = tasks.priority.enumValues.find(
			// 		priority => priority === cell.getValue<Task['priority']>(),
			// 	);

			// 	if (!priority) return null;

			// 	const Icon = getPriorityIcon(priority);

			// 	return (
			// 		<Badge variant='outline' className='py-1 [&>svg]:size-3.5'>
			// 			<Icon />
			// 			<span className='capitalize'>{priority}</span>
			// 		</Badge>
			// 	);
			// },
			meta: {
				label: 'Orders',
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
			},
			enableColumnFilter: true,
		},
		// {
		// 	id: 'actions',
		// 	cell: function Cell({ row }) {
		// 		const [isUpdatePending, startUpdateTransition] = React.useTransition();

		// 		return (
		// 			<DropdownMenu>
		// 				<DropdownMenuTrigger asChild>
		// 					<Button
		// 						aria-label='Open menu'
		// 						variant='ghost'
		// 						className='flex size-8 p-0 data-[state=open]:bg-muted'
		// 					>
		// 						<Ellipsis className='size-4' aria-hidden='true' />
		// 					</Button>
		// 				</DropdownMenuTrigger>
		// 				<DropdownMenuContent align='end' className='w-40'>
		// 					<DropdownMenuItem
		// 						onSelect={() => setRowAction({ row, variant: 'update' })}
		// 					>
		// 						Edit
		// 					</DropdownMenuItem>
		// 					<DropdownMenuSub>
		// 						<DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
		// 						<DropdownMenuSubContent>
		// 							<DropdownMenuRadioGroup
		// 								value={row.original.label}
		// 								onValueChange={value => {
		// 									startUpdateTransition(() => {
		// 										toast.promise(
		// 											updateTask({
		// 												id: row.original.id,
		// 												label: value as Task['label'],
		// 											}),
		// 											{
		// 												loading: 'Updating...',
		// 												success: 'Label updated',
		// 												error: err => getErrorMessage(err),
		// 											},
		// 										);
		// 									});
		// 								}}
		// 							>
		// 								{tasks.label.enumValues.map(label => (
		// 									<DropdownMenuRadioItem
		// 										key={label}
		// 										value={label}
		// 										className='capitalize'
		// 										disabled={isUpdatePending}
		// 									>
		// 										{label}
		// 									</DropdownMenuRadioItem>
		// 								))}
		// 							</DropdownMenuRadioGroup>
		// 						</DropdownMenuSubContent>
		// 					</DropdownMenuSub>
		// 					<DropdownMenuSeparator />
		// 					<DropdownMenuItem
		// 						onSelect={() => setRowAction({ row, variant: 'delete' })}
		// 					>
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
