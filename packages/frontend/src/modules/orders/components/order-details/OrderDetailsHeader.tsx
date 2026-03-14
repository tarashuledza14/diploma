import {
	Badge,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft, CheckCircle2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderStatusOptions } from '../../constants/order-status.constants';
import { formatOrderNumber } from '../../utils/format-order-number';
import { priorityColors, statusColors } from '../order-list/orderColors';

interface Props {
	order: any;
	onStatusChange: (status: string) => void;
	onEditOrder: () => void;
	onCompleteOrder: () => void;
	isUpdatingStatus?: boolean;
	isCompletingOrder?: boolean;
}
export function OrderDetailsHeader({
	order,
	onStatusChange,
	onEditOrder,
	onCompleteOrder,
	isUpdatingStatus = false,
	isCompletingOrder = false,
}: Props) {
	return (
		<div className='mb-6 flex items-start justify-between'>
			<div className='flex items-center gap-4'>
				<Link to='/orders'>
					<Button variant='ghost' size='icon'>
						<ArrowLeft className='h-5 w-5' />
						<span className='sr-only'>Back to orders</span>
					</Button>
				</Link>
				<div>
					<div className='flex items-center gap-3'>
						<h1 className='text-2xl font-bold'>
							{formatOrderNumber(order.orderNumber)}
						</h1>
						<Badge
							className={cn(
								statusColors[order.status as keyof typeof statusColors],
							)}
						>
							{String(order.status).replace(/_/g, ' ')}
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
						Created on{' '}
						{order.createdAt
							? new Date(order.createdAt).toLocaleDateString()
							: '—'}
					</p>
				</div>
			</div>
			<div className='flex gap-2'>
				<Select
					defaultValue={String(order.status)}
					value={String(order.status)}
					onValueChange={onStatusChange}
				>
					<SelectTrigger className='w-40' disabled={isUpdatingStatus}>
						<SelectValue placeholder='Status' />
					</SelectTrigger>
					<SelectContent>
						{orderStatusOptions.map(option => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button variant='outline' onClick={onEditOrder}>
					<Edit className='mr-2 h-4 w-4' />
					Edit Order
				</Button>
				<Button onClick={onCompleteOrder} disabled={isCompletingOrder}>
					<CheckCircle2 className='mr-2 h-4 w-4' />
					Complete Order
				</Button>
			</div>
		</div>
	);
}
