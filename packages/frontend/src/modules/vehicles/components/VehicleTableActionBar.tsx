import { clientKeys } from '@/modules/clients/queries/keys';
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
import { CheckCircle2, Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { VehicleService } from '../api/vehicles.service';
import { vehicleStatusInfo } from '../constants/vehicle-status.constans';
import { VehicleWithOwnerInfo } from '../interfaces/get-vehicle.interface';
import { UpdateBulkVehiclesDto } from '../interfaces/update-bulk-vehicle.interface';
import { vehicleKeys } from '../query/keys';

interface VehicleTableActionBarProps {
	table: Table<VehicleWithOwnerInfo>;
}

export function VehicleTableActionBar({ table }: VehicleTableActionBarProps) {
	const { t } = useTranslation();
	const rows = table.getFilteredSelectedRowModel().rows;
	const queryClient = useQueryClient();

	const { mutate: deleteVehicles } = useMutation({
		mutationKey: clientKeys.mutations.delete,
		mutationFn: async (vehicleIds: string[]) =>
			VehicleService.deleteVehiclesBulk(vehicleIds),
		onSuccess: () => {
			toast.success(
				t('vehicles.messages.bulkDeleteSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: vehicleKeys.all,
			});
		},
		onError: () => {
			toast.error(t('vehicles.messages.bulkDeleteError'));
		},
	});

	const { mutate: updateVehicle } = useMutation({
		mutationKey: vehicleKeys.mutations.updateBulk(),
		mutationFn: async (data: UpdateBulkVehiclesDto) => {
			VehicleService.updateVehicleBulk(data);
		},
		onSuccess: () => {
			toast.success(
				t('vehicles.messages.bulkUpdateSuccess', { count: rows.length }),
			);
			table.toggleAllRowsSelected(false);
			queryClient.invalidateQueries({
				queryKey: vehicleKeys.lists(),
			});
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

	const onVehicleDelete = useCallback(() => {
		deleteVehicles(rows.map(row => row.original.id));
	}, [rows, deleteVehicles]);

	const onVehicleUpdate = useCallback(
		(field: keyof VehicleWithOwnerInfo, value: any) => {
			updateVehicle({ ids: rows.map(row => row.original.id), field, value });
		},
		[rows, updateVehicle],
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
						{Object.entries(vehicleStatusInfo).map(([status]) => (
							<DropdownMenuItem
								key={status}
								className='capitalize'
								onClick={() => onVehicleUpdate('status', status)}
							>
								{t(`vehicleStatus.${status}`)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<ActionBarItem variant='destructive' onClick={onVehicleDelete}>
					<Trash2 />
					{t('common.delete')}
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
