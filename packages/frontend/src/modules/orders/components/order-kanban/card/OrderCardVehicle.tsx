import { Car } from 'lucide-react';
import { KanbanOrder } from './OrderCard';

export function OrderCardVehicle({ order }: { order: KanbanOrder }) {
	return (
		<div className='mb-2 flex items-center gap-1.5'>
			<Car className='h-4 w-4 text-muted-foreground' />
			<span className='font-medium'>
				{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
			</span>
		</div>
	);
}
