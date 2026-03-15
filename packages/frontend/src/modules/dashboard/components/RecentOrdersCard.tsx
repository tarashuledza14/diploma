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
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { DashboardRecentOrder } from '../types';

export function RecentOrdersCard({
	recentOrders,
	statusColors,
}: {
	recentOrders: DashboardRecentOrder[];
	statusColors: Record<OrderStatus, string>;
}) {
	const { t } = useTranslation();
	const statusLabels: Record<OrderStatus, string> = {
		[OrderStatus.NEW]: t('orderStatus.NEW'),
		[OrderStatus.IN_PROGRESS]: t('orderStatus.IN_PROGRESS'),
		[OrderStatus.WAITING_PARTS]: t('orderStatus.WAITING_PARTS'),
		[OrderStatus.COMPLETED]: t('orderStatus.COMPLETED'),
		[OrderStatus.PAID]: t('orderStatus.PAID'),
		[OrderStatus.CANCELLED]: t('orderStatus.CANCELLED'),
	};
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>{t('dashboard.recentOrders.title')}</CardTitle>
						<CardDescription>
							{t('dashboard.recentOrders.subtitle')}
						</CardDescription>
					</div>
					<Link to='/orders'>
						<Button variant='outline' size='sm'>
							{t('common.viewAll')}
						</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{recentOrders.length === 0 && (
						<div className='rounded-lg border p-3 text-sm text-muted-foreground'>
							{t('dashboard.recentOrders.empty')}
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
