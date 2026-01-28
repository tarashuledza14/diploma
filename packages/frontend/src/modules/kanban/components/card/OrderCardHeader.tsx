import { cn } from '@/lib/utils';
import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { MoreVertical } from 'lucide-react';
import { Order } from './OrderCard';

const priorityColors = {
	high: 'bg-red-100 text-red-700 border-red-200',
	medium: 'bg-amber-100 text-amber-700 border-amber-200',
	low: 'bg-green-100 text-green-700 border-green-200',
};

export function OrderCardHeader({ order }: { order: Order }) {
	return (
		<div className='mb-3 flex items-start justify-between'>
			<div className='flex items-center gap-2'>
				<span className='font-mono text-sm font-medium text-muted-foreground'>
					{order.id}
				</span>
				<Badge
					variant='outline'
					className={cn('text-xs', priorityColors[order.priority])}
				>
					{order.priority}
				</Badge>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
					<Button variant='ghost' size='icon' className='h-8 w-8'>
						<MoreVertical className='h-4 w-4' />
						<span className='sr-only'>Order actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuItem>View Details</DropdownMenuItem>
					<DropdownMenuItem>Assign Mechanic</DropdownMenuItem>
					<DropdownMenuItem>Change Status</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
