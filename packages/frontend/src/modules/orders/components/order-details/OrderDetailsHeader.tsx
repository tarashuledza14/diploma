import { cn } from '@/lib/utils';
import {
	Badge,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { ArrowLeft, CheckCircle2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { priorityColors, statusColors } from '../order-list/orderColors';

interface Props {
	order: any;
}
export function OrderDetailsHeader({ order }: Props) {
	return (
		<div className='mb-6 flex items-start justify-between'>
			<div className='flex items-center gap-4'>
				<Link to='/orders/board'>
					<Button variant='ghost' size='icon'>
						<ArrowLeft className='h-5 w-5' />
						<span className='sr-only'>Back to orders</span>
					</Button>
				</Link>
				<div>
					<div className='flex items-center gap-3'>
						<h1 className='text-2xl font-bold'>{order.id}</h1>
						<Badge
							className={cn(
								statusColors[order.status as keyof typeof statusColors],
							)}
						>
							{order.status.replace('_', ' ')}
						</Badge>
						<Badge
							variant='outline'
							className={cn(
								priorityColors[order.priority as keyof typeof priorityColors],
							)}
						>
							{order.priority} priority
						</Badge>
					</div>
					<p className='text-muted-foreground'>
						Created on {new Date(order.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div className='flex gap-2'>
				<Select defaultValue={order.status}>
					<SelectTrigger className='w-40'>
						<SelectValue placeholder='Status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='new'>New</SelectItem>
						<SelectItem value='in_progress'>In Progress</SelectItem>
						<SelectItem value='waiting_parts'>Waiting Parts</SelectItem>
						<SelectItem value='done'>Done</SelectItem>
					</SelectContent>
					{/* TODO: Call OrderService.updateStatus() on change */}
				</Select>
				<Button variant='outline'>
					<Edit className='mr-2 h-4 w-4' />
					Edit Order
					{/* TODO: Open EditOrderModal */}
				</Button>
				<Button>
					<CheckCircle2 className='mr-2 h-4 w-4' />
					Complete Order
					{/* TODO: Call OrderService.complete() */}
				</Button>
			</div>
		</div>
	);
}
