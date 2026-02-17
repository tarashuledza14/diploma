import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { VehicleService } from '../modules/vehicles/api/vehicles.service';
import { VehiclesHeader } from '../modules/vehicles/components/VehiclesHeader';
import { VehicleTable } from '../modules/vehicles/components/VehicleTable';
import { vehicleKeys } from '../modules/vehicles/query/keys';

export function VehiclePage() {
	const searchParams = useTableSearchParams();

	const { data } = useQuery({
		queryKey: vehicleKeys.list(searchParams),
		queryFn: () => VehicleService.getAll(searchParams),
		placeholderData: previousData => previousData,
	});

	const { data: statusCounts } = useQuery({
		queryKey: vehicleKeys.statusCounts(),
		queryFn: () => VehicleService.getStatusCounts(),
	});

	return (
		<div className='flex flex-col gap-6'>
			<VehiclesHeader />
			<VehicleTable
				data={data?.data ?? []}
				pageCount={data?.pageCount ?? 0}
				statusCounts={statusCounts}
			/>
		</div>
	);
}
