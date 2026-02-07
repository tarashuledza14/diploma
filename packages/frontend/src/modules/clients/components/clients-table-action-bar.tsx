import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from '@/shared/components/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { ClientService } from '../api/client.service'
import type { Client } from '../interfaces/client.interface'
import { clientKeys } from '../queries/keys'

interface ClientsTableActionBarProps {
	table: Table<Client>;
}

export function ClientsTableActionBar({ table }: ClientsTableActionBarProps) {
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: deleteClients } = useMutation({
		mutationKey: clientKeys.mutations.delete,
		mutationFn: async (clientIds: string[]) =>
			ClientService.deleteClientsBulk(clientIds),
		onSuccess: () => {
			toast.success(`${rows.length} client(s) deleted`);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: clientKeys.lists(),
			});
		},
		onError: () => {
			toast.error('Failed to delete clients');
		},
	});

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				table.toggleAllRowsSelected(false);
			}
		},
		[table],
	);

	const onClientDelete = useCallback(() => {
		deleteClients(rows.map(row => row.original.id));
	}, [rows, deleteClients]);

	return (
		<ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
			<ActionBarSelection>
				<span className='font-medium'>{rows.length}</span>
				<span>selected</span>
				<ActionBarSeparator />
				<ActionBarClose>
					<X />
				</ActionBarClose>
			</ActionBarSelection>
			<ActionBarSeparator />
			<ActionBarGroup>
				<ActionBarItem variant='destructive' onClick={onClientDelete}>
					<Trash2 />
					Delete
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
