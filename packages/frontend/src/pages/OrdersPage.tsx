import { useUserStore } from '@/modules/auth';
import { OrdersTable, PageHeader } from '@/modules/orders';
import { OrdersService } from '@/modules/orders/api';
import { ordersKeys } from '@/modules/orders/queries/keys';
import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export function OrdersPage() {
	const { t } = useTranslation();
	const role = useUserStore(state => state.user?.role);
	const searchParams = useTableSearchParams();
	const { data } = useQuery({
		queryKey: ordersKeys.list(searchParams),
		queryFn: () => OrdersService.getAll(searchParams),
		placeholderData: previousData => previousData,
	});
	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title={t('orders.pageTitle')}
				subtitle={t('orders.pageSubtitle')}
				showNewOrder={role !== 'MECHANIC'}
			/>

			<OrdersTable data={data?.data ?? []} pageCount={data?.pageCount ?? 0} />
		</div>
	);
}
