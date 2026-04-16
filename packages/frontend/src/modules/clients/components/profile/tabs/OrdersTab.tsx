import { useCurrencyFormatter } from '@/modules/app-settings';
import type { Order } from '@/modules/orders/interfaces/order.interface';
import { Badge, Card, CardContent, ScrollArea } from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { useTranslation } from 'react-i18next';

interface OrdersTabProps {
	mockClientOrders: Order[];
	orderStatusColors: Record<string, string>;
}

export function OrdersTab({
	mockClientOrders,
	orderStatusColors,
}: OrdersTabProps) {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();

	const getOrderStatusLabel = (value: unknown) => {
		const raw = String(value ?? '');
		const normalizedKey = raw.toUpperCase().replace(/-/g, '_');
		const fallback = raw
			.replace(/[_-]/g, ' ')
			.replace(/\b\w/g, char => char.toUpperCase());

		return t(`orderStatus.${normalizedKey}`, {
			defaultValue: fallback || '-',
		});
	};

	const getStatusClassName = (value: unknown) => {
		const raw = String(value ?? '');
		const lower = raw.toLowerCase().replace(/_/g, '-');
		const upper = raw.toUpperCase().replace(/-/g, '_');

		return (
			orderStatusColors[raw] ??
			orderStatusColors[lower] ??
			orderStatusColors[upper] ??
			'bg-muted text-foreground'
		);
	};

	return (
		<ScrollArea className='h-50'>
			<div className='space-y-2 pr-4'>
				{mockClientOrders.map(order => (
					<Card key={order.id}>
						<CardContent className='p-3'>
							<div className='flex items-center justify-between mb-1'>
								<div className='flex items-center gap-2'>
									<span className='font-medium'>{order.vehicleId}</span>
									<Badge className={getStatusClassName(order.status)}>
										{getOrderStatusLabel(order.status)}
									</Badge>
								</div>
								<span className='font-semibold'>
									{formatCurrency(order.totalAmount)}
								</span>
							</div>
							<div className='flex items-center justify-between text-sm text-muted-foreground'>
								<span>
									{order.vehicleId} - {order.description}
								</span>
								<span>
									{formatDate(order.startDate, { month: 'short' })} -{' '}
									{order.endDate
										? formatDate(order.endDate, { month: 'short' })
										: t('orderStatus.IN_PROGRESS')}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}
