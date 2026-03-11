import { useQuery } from '@tanstack/react-query';
import { OrdersService } from '../api';
import { ordersKeys } from '../queries/keys';

export function useOrderDetailsQuery(orderId: string | undefined) {
	return useQuery({
		queryKey: ordersKeys.detail(orderId ?? ''),
		queryFn: () => OrdersService.getById(orderId!),
		enabled: !!orderId,
	});
}
