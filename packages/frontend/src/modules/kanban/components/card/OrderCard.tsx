import { Card, CardContent } from '@/shared/components/ui';
import { Link } from 'react-router-dom';
import { OrderCardFooter } from './OrderCardFooter';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardServices } from './OrderCardServices';
import { OrderCardVehicle } from './OrderCardVehicle';

export interface Order {
	id: string;
	status: string;
	vehicle: {
		make: string;
		model: string;
		year: number;
		plate: string;
	};
	client: {
		name: string;
		avatar: string;
	};
	services: string[];
	priority: 'high' | 'medium' | 'low';
	dueDate: string;
	assignedTo: {
		name: string;
		avatar: string;
	};
}

export interface OrderCardProps {
	order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
	return (
		<Link to={`/orders/${order.id}`}>
			<Card className='cursor-pointer transition-all hover:shadow-md hover:border-primary/50'>
				<CardContent className='p-4'>
					<OrderCardHeader order={order} />
					<OrderCardVehicle order={order} />
					<p className='mb-3 text-sm text-muted-foreground'>
						Plate: {order.vehicle.plate}
					</p>
					<OrderCardServices order={order} />
					<OrderCardFooter order={order} />
				</CardContent>
			</Card>
		</Link>
	);
}
