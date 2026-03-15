import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Table } from '@tanstack/react-table';
import { CheckCircle2, CircleSlash, Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ServicesService } from '../api/services.service';
import { Service } from '../interfaces/services.interface';
import { serviceKeys } from '../queries/keys';

interface ServicesTableActionBarProps {
	table: Table<Service>;
}

export function ServicesTableActionBar({ table }: ServicesTableActionBarProps) {
	const { t } = useTranslation();
	const statusOptions: {
		value: boolean;
		label: string;
		icon: typeof CheckCircle2;
	}[] = [
		{ value: true, label: t('services.status.active'), icon: CheckCircle2 },
		{ value: false, label: t('services.status.inactive'), icon: CircleSlash },
	];
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: deleteServices } = useMutation({
		mutationKey: serviceKeys.mutations.delete(),
		mutationFn: async (ids: string[]) => ServicesService.deleteBulk(ids),
		onSuccess: () => {
			toast.success(
				t('services.messages.bulkDeleteSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: serviceKeys.all,
			});
		},
		onError: () => {
			toast.error(t('services.messages.bulkDeleteError'));
		},
	});

	const { mutate: updateStatus } = useMutation({
		mutationKey: serviceKeys.mutations.updateBulk(),
		mutationFn: async ({ ids, status }: { ids: string[]; status: boolean }) =>
			ServicesService.updateBulkStatus(ids, status),
		onSuccess: () => {
			toast.success(
				t('services.messages.bulkUpdateSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: serviceKeys.all,
			});
		},
		onError: () => {
			toast.error(t('services.messages.bulkUpdateError'));
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

	const onDelete = useCallback(() => {
		deleteServices(rows.map(row => row.original.id));
	}, [rows, deleteServices]);

	const onStatusChange = useCallback(
		(status: boolean) => {
			updateStatus({
				ids: rows.map(row => row.original.id),
				status,
			});
		},
		[rows, updateStatus],
	);

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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ActionBarItem>
							<CheckCircle2 />
							{t('common.status')}
						</ActionBarItem>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{statusOptions.map(({ value, label, icon: Icon }) => (
							<DropdownMenuItem
								key={String(value)}
								onClick={() => onStatusChange(value)}
							>
								<Icon className='mr-2 h-4 w-4' />
								{label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<ActionBarItem variant='destructive' onClick={onDelete}>
					<Trash2 />
					{t('common.delete')}
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
