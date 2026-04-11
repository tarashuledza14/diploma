import { OrdersService } from '@/modules/orders/api';
import { ordersKeys } from '@/modules/orders/queries/keys';
import { useQuery } from '@tanstack/react-query';

export function useDispatchWorkloadQuery(enabled = true) {
	return useQuery({
		queryKey: ordersKeys.workload(),
		queryFn: () => OrdersService.getMechanicsWorkload(),
		enabled,
		staleTime: 30_000,
	});
}
