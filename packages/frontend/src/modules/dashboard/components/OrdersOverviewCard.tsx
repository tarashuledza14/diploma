import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Progress,
} from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { DashboardOrderStatusItem } from '../types';

export function OrdersOverviewCard({
	ordersByStatus,
	totalOrders,
}: {
	ordersByStatus: DashboardOrderStatusItem[];
	totalOrders: number;
}) {
	const { t } = useTranslation();
	return (
		<Card className='lg:col-span-2'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>{t('dashboard.ordersOverview.title')}</CardTitle>
						<CardDescription>
							{t('dashboard.ordersOverview.subtitle')}
						</CardDescription>
					</div>
					<Link to='/orders/board'>
						<Button variant='outline' size='sm'>
							{t('dashboard.ordersOverview.viewBoard')}
						</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{ordersByStatus.map(item => (
						<div key={item.status} className='flex items-center gap-4'>
							<div className='w-24 text-sm font-medium'>{item.label}</div>
							<div className='flex-1'>
								<Progress
									value={totalOrders > 0 ? (item.count / totalOrders) * 100 : 0}
									className='h-2'
								/>
							</div>
							<div className='w-12 text-right text-sm font-medium'>
								{item.count}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
