import { ScrollArea } from '@/shared/components/ui';
import { Order, OrderCard } from '../card/OrderCard';
import { KanbanColumnAddButton } from './KanbanColumnAddButton';
import { KanbanColumnHeader } from './KanbanColumnHeader';

export interface KanbanColumnProps {
	column: {
		id: string;
		title: string;
		color: string;
		icon: any;
	};
	orders: Order[];
}

export function KanbanColumn({ column, orders }: KanbanColumnProps) {
	return (
		<div className='flex min-w-[320px] flex-col rounded-lg bg-muted/50'>
			<div className='flex items-center justify-between p-4'>
				<KanbanColumnHeader
					title={column.title}
					color={column.color}
					count={orders.length}
				/>
				<KanbanColumnAddButton title={column.title} defaultStatus={column.id} />
			</div>
			<ScrollArea className='flex-1 px-4 pb-4'>
				<div className='flex flex-col gap-3'>
					{orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
