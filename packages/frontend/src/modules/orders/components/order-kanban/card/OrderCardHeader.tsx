import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KanbanOrder } from './OrderCard';

const priorityColors: Record<KanbanOrder['priority'], string> = {
	high: 'bg-red-100 text-red-700 border-red-200',
	medium: 'bg-amber-100 text-amber-700 border-amber-200',
	low: 'bg-green-100 text-green-700 border-green-200',
};

export function OrderCardHeader({ order }: { order: KanbanOrder }) {
	const navigate = useNavigate();

	const stopDrag = (e: React.PointerEvent | React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div className='mb-2 flex items-start justify-between'>
			<div className='flex items-center gap-2'>
				<span className='font-mono text-xs font-medium text-muted-foreground'>
					{order.id.slice(0, 8)}
				</span>
				<Badge
					variant='outline'
					className={cn('text-xs', priorityColors[order.priority])}
				>
					{order.priority}
				</Badge>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='h-7 w-7'
						onPointerDown={stopDrag}
						onMouseDown={stopDrag}
						onClick={e => e.stopPropagation()}
					>
						<MoreVertical className='h-4 w-4' />
						<span className='sr-only'>Order actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					onPointerDownCapture={stopDrag}
					onMouseDownCapture={stopDrag}
					onClick={e => e.stopPropagation()}
				>
					<DropdownMenuItem
						onSelect={e => {
							e.preventDefault();
							navigate(`/orders/${order.id}`);
						}}
					>
						View Details
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
