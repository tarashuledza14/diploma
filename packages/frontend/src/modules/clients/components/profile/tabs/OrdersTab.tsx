import type { Order } from '@/modules/orders';
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
	return (
		<ScrollArea className='h-[200px]'>
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
								<span className='font-semibold'>${order.totalAmount}</span>
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
