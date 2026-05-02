import { Card, CardContent } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';
import { OrderCardFooter } from './OrderCardFooter';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardServices } from './OrderCardServices';
import { OrderCardVehicle } from './OrderCardVehicle';

export interface KanbanOrder {
	id: string;
	orderNumber: number;
	status: string;
	vehicle: {
		make: string;
		model: string;
		year: number;
		plate: string;
	};
	client: {
		name: string;
		avatar?: string | null;
	};
	services: string[];
	priority: 'high' | 'medium' | 'low';
	dueDate: string | null;
}

interface OrderCardProps {
	order: KanbanOrder;
}

export function OrderCard({ order }: OrderCardProps) {
	const { t } = useTranslation();
	return (
		<Card className='transition-all hover:shadow-md hover:border-primary/50'>
			<CardContent className='p-3'>
				<OrderCardHeader order={order} />
				<OrderCardVehicle order={order} />
				<p className='mb-2 text-sm text-muted-foreground'>
					{t('common.plate')}: {order.vehicle.plate || '—'}
				</p>
				<OrderCardServices order={order} />
				<OrderCardFooter order={order} />
			</CardContent>
		</Card>
	);
}
