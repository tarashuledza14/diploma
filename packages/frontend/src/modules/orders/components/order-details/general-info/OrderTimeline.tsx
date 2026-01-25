import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Calendar, Clock } from 'lucide-react';

interface Props {
	order: any;
}
export function OrderTimeline({ order }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Calendar className='h-5 w-5' />
					Timeline
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-muted-foreground' />
						<span className='text-sm'>Created</span>
					</div>
					<span className='text-sm font-medium'>
						{new Date(order.createdAt).toLocaleString()}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-muted-foreground' />
						<span className='text-sm'>Due Date</span>
					</div>
					<span className='text-sm font-medium'>
						{new Date(order.dueDate).toLocaleString()}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-amber-500' />
						<span className='text-sm'>Est. Completion</span>
					</div>
					<span className='text-sm font-medium'>
						{new Date(order.estimatedCompletion).toLocaleString()}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
