import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Progress,
} from '@/shared/components/ui';
import { Link } from 'react-router-dom';

export function OrdersOverviewCard({
	ordersByStatus,
	totalOrders,
}: {
	ordersByStatus: any[];
	totalOrders: number;
}) {
	return (
		<Card className='lg:col-span-2'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle>Orders Overview</CardTitle>
						<CardDescription>Order distribution by status</CardDescription>
					</div>
					<Link to='/orders/board'>
						<Button variant='outline' size='sm'>
							View Board
						</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{ordersByStatus.map(item => (
						<div key={item.status} className='flex items-center gap-4'>
							<div className='w-24 text-sm font-medium'>{item.status}</div>
							<div className='flex-1'>
								<Progress
									value={(item.count / totalOrders) * 100}
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
