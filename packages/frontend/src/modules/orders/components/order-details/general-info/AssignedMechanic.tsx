import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	order: any;
}
export function AssignedMechanic({ order }: Props) {
	const { t } = useTranslation();
	const assignedTo = order.assignedTo;
	if (!assignedTo) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Wrench className='h-5 w-5' />
						{t('orders.generalInfo.assignedMechanic')}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-sm text-muted-foreground'>
						{t('orders.generalInfo.noMechanicAssigned')}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Wrench className='h-5 w-5' />
					{t('orders.generalInfo.assignedMechanic')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Avatar className='h-10 w-10'>
							<AvatarImage src={assignedTo.avatar || '/placeholder.svg'} />
							<AvatarFallback>
								{assignedTo.name
									.split(' ')
									.map(n => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className='font-medium'>{assignedTo.name}</p>
							<p className='text-sm text-muted-foreground'>
								{assignedTo.specialty ?? '—'}
							</p>
						</div>
					</div>
					<Button variant='outline' size='sm'>
						{t('orders.generalInfo.reassign')}
					</Button>
				</div>
				{(order.notes ?? order.description) && (
					<>
						<Separator className='my-4' />
						<div>
							<p className='mb-2 text-sm font-medium'>{t('common.notes')}</p>
							<p className='text-sm text-muted-foreground'>
								{order.notes ?? order.description}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
