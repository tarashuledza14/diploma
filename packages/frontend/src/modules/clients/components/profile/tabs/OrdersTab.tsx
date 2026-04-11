import { useCurrencyFormatter } from '@/modules/app-settings';
import type { Order } from '@/modules/orders/interfaces/order.interface';
import { Badge, Card, CardContent, ScrollArea } from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';

interface OrdersTabProps {
	mockClientOrders: Order[];
	orderStatusColors: Record<string, string>;
}

export function OrdersTab({
	mockClientOrders,
	orderStatusColors,
}: OrdersTabProps) {
	const { formatCurrency } = useCurrencyFormatter();
	return (
		<ScrollArea className='h-50'>
			<div className='space-y-2 pr-4'>
				{mockClientOrders.map(order => (
					<Card key={order.id}>
						<CardContent className='p-3'>
							<div className='flex items-center justify-between mb-1'>
								<div className='flex items-center gap-2'>
									<span className='font-medium'>{order.vehicleId}</span>
									<Badge className={orderStatusColors[order.status]}>
										{order.status.toUpperCase()}
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
										: 'Still in progress'}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}
