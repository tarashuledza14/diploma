import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import { Clock, User } from 'lucide-react';
import { Order } from './OrderCard';

export function OrderCardFooter({ order }: { order: Order }) {
	return (
		<>
			<div className='flex items-center justify-between border-t border-border pt-3'>
				<div className='flex items-center gap-2'>
					<Avatar className='h-6 w-6'>
						<AvatarImage src={order.client.avatar || '/placeholder.svg'} />
						<AvatarFallback>
							{order.client.name
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<span className='text-xs text-muted-foreground'>
						{order.client.name}
					</span>
				</div>
				<div className='flex items-center gap-1 text-xs text-muted-foreground'>
					<Clock className='h-3 w-3' />
					{new Date(order.dueDate).toLocaleDateString()}
				</div>
			</div>
			<div className='mt-2 flex items-center gap-2'>
				<User className='h-3 w-3 text-muted-foreground' />
				<span className='text-xs text-muted-foreground'>
					{order.assignedTo.name}
				</span>
			</div>
		</>
	);
}
