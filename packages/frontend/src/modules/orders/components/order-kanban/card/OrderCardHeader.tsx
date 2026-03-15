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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatOrderNumber } from '../../../utils/format-order-number';
import { KanbanOrder } from './OrderCard';

const priorityColors: Record<KanbanOrder['priority'], string> = {
	high: 'bg-red-100 text-red-700 border-red-200',
	medium: 'bg-amber-100 text-amber-700 border-amber-200',
	low: 'bg-green-100 text-green-700 border-green-200',
};

export function OrderCardHeader({ order }: { order: KanbanOrder }) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const stopDrag = (e: React.PointerEvent | React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div className='mb-2 flex items-start justify-between'>
			<div className='flex items-center gap-2'>
				<span className='font-mono text-xs font-medium text-muted-foreground'>
					{formatOrderNumber(order.orderNumber)}
				</span>
				<Badge
					variant='outline'
					className={cn('text-xs', priorityColors[order.priority])}
				>
					{t(`orderPriority.${order.priority.toUpperCase()}`)}
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
						<span className='sr-only'>
							{t('orders.newOrder.actions.orderActions')}
						</span>
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
						{t('orders.actions.viewDetails')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
