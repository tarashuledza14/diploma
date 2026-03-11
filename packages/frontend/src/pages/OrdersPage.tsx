import { OrdersTable, PageHeader } from '@/modules/orders';
import { OrdersService } from '@/modules/orders/api';
import { ordersKeys } from '@/modules/orders/queries/keys';
import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';

export function OrdersPage() {
	const searchParams = useTableSearchParams();
	const { data } = useQuery({
		queryKey: ordersKeys.list(searchParams),
		queryFn: () => OrdersService.getAll(searchParams),
		placeholderData: previousData => previousData,
	});
	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Orders'
				subtitle='Manage and track all service orders'
			/>

			<OrdersTable data={data?.data ?? []} pageCount={data?.pageCount ?? 0} />
		</div>
	);
}
