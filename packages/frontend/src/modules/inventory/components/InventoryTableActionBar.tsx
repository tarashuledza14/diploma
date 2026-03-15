import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Table } from '@tanstack/react-table';
import { Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { InventoryService } from '../api/inventory.service';
import { InventoryPart } from '../interfaces/inventory.interfaces';
import { inventoryKeys } from '../query/keys';

interface InventoryTableActionBarProps {
	table: Table<InventoryPart>;
}

export function InventoryTableActionBar({
	table,
}: InventoryTableActionBarProps) {
	const { t } = useTranslation();
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: deleteParts } = useMutation({
		mutationKey: inventoryKeys.mutations.deleteBulk(),
		mutationFn: async (partIds: string[]) =>
			InventoryService.deleteBulk(partIds),
		onSuccess: () => {
			toast.success(
				t('inventory.messages.bulkDeleteSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: inventoryKeys.lists(),
			});
		},
		onError: () => {
			toast.error(t('inventory.messages.bulkDeleteError'));
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

	const onPartDelete = useCallback(() => {
		deleteParts(rows.map(row => row.original.id));
	}, [rows, deleteParts]);

	return (
		<ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
			<ActionBarSelection>
				<span className='font-medium'>{rows.length}</span>
				<span>{t('common.selected')}</span>
				<ActionBarSeparator />
				<ActionBarClose>
					<X />
				</ActionBarClose>
			</ActionBarSelection>
			<ActionBarSeparator />
			<ActionBarGroup>
				<ActionBarItem variant='destructive' onClick={onPartDelete}>
					<Trash2 />
					{t('common.delete')}
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
