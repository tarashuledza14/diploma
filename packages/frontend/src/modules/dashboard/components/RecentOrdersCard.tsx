import { OrderStatus } from '@/modules/orders/interfaces/order.enums';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Link } from 'react-router-dom';
import type { DashboardRecentOrder } from '../types';

const statusLabels: Record<OrderStatus, string> = {
	[OrderStatus.NEW]: 'New',
	[OrderStatus.IN_PROGRESS]: 'In Progress',
	[OrderStatus.WAITING_PARTS]: 'Waiting Parts',
	[OrderStatus.COMPLETED]: 'Completed',
	[OrderStatus.PAID]: 'Paid',
	[OrderStatus.CANCELLED]: 'Cancelled',
};

export function RecentOrdersCard({
	recentOrders,
	statusColors,
}: {
	recentOrders: DashboardRecentOrder[];
	statusColors: Record<OrderStatus, string>;
}) {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>Recent Orders</CardTitle>
						<CardDescription>Latest service orders</CardDescription>
					</div>
					<Link to='/orders'>
						<Button variant='outline' size='sm'>
							View All
						</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{recentOrders.length === 0 && (
						<div className='rounded-lg border p-3 text-sm text-muted-foreground'>
							No recent orders found.
						</div>
					)}
					{recentOrders.map(order => (
						<Link key={order.id} to={`/orders/${order.id}`}>
							<div className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50'>
								<div className='flex items-center gap-3'>
									<Avatar className='h-9 w-9'>
										<AvatarImage src={order.avatar || '/placeholder.svg'} />
										<AvatarFallback>
											{order.client
												.split(' ')
												.map(name => name[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className='text-sm font-medium'>{order.id}</p>
										<p className='text-xs text-muted-foreground'>
											{order.client} - {order.vehicle}
										</p>
									</div>
								</div>
								<Badge className={statusColors[order.status]}>
									{statusLabels[order.status]}
								</Badge>
							</div>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
