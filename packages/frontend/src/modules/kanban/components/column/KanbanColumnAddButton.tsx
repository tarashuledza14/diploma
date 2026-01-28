import { NewOrderModal } from '@/modules/orders/components/order-list/add-order/AddOrder'
import { Button } from '@/shared/components/ui'
import { Plus } from 'lucide-react'

export interface KanbanColumnAddButtonProps {
	title: string;
	defaultStatus?: string;
}

export function KanbanColumnAddButton({
	title,
	defaultStatus,
}: KanbanColumnAddButtonProps) {
	return (
		<NewOrderModal
			defaultStatus={defaultStatus}
			trigger={
				<Button variant='ghost' size='icon' className='h-8 w-8'>
					<Plus className='h-4 w-4' />
					<span className='sr-only'>Add order to {title}</span>
				</Button>
			}
		/>
	);
}
