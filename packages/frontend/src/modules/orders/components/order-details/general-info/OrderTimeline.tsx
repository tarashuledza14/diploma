import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	order: any;
}
export function OrderTimeline({ order }: Props) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Calendar className='h-5 w-5' />
					{t('orders.timeline.title')}
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-muted-foreground' />
						<span className='text-sm'>{t('orders.timeline.created')}</span>
					</div>
					<span className='text-sm font-medium'>
						{order.createdAt
							? new Date(order.createdAt).toLocaleString()
							: t('common.notAvailable')}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-muted-foreground' />
						<span className='text-sm'>{t('orders.timeline.dueDate')}</span>
					</div>
					<span className='text-sm font-medium'>
						{order.dueDate
							? new Date(order.dueDate).toLocaleString()
							: t('common.notAvailable')}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-amber-500' />
						<span className='text-sm'>
							{t('orders.timeline.estimatedCompletion')}
						</span>
					</div>
					<span className='text-sm font-medium'>
						{order.estimatedCompletion
							? new Date(order.estimatedCompletion).toLocaleString()
							: t('common.notAvailable')}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
