import { Badge } from '@/shared/components/ui';
import { Order } from './OrderCard';

export function OrderCardServices({ order }: { order: Order }) {
	return (
		<div className='mb-3 flex flex-wrap gap-1'>
			{order.services.slice(0, 2).map(service => (
				<Badge key={service} variant='secondary' className='text-xs'>
					{service}
				</Badge>
			))}
			{order.services.length > 2 && (
				<Badge variant='secondary' className='text-xs'>
					+{order.services.length - 2} more
				</Badge>
			)}
		</div>
	);
}
