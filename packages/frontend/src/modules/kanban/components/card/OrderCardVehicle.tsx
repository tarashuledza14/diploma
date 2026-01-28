import { Car } from 'lucide-react';
import { Order } from './OrderCard';

export function OrderCardVehicle({ order }: { order: Order }) {
	return (
		<div className='mb-3 flex items-center gap-2'>
			<Car className='h-4 w-4 text-muted-foreground' />
			<span className='font-medium'>
				{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
			</span>
		</div>
	);
}
