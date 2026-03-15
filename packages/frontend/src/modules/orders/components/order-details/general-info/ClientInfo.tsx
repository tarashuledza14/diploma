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
import { Edit, Mail, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	order: any;
}
export function ClientInfo({ order }: Props) {
	const { t } = useTranslation();
	const client = order.client;
	if (!client) return null;

	const clientName = client.name ?? client.fullName ?? '—';
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<User className='h-5 w-5' />
					{t('orders.generalInfo.clientInformation')}
				</CardTitle>
				<Button variant='ghost' size='sm'>
					<Edit className='mr-2 h-4 w-4' />
					{t('common.edit')}
					{/* TODO: Open EditClientModal or navigate to /clients/:id */}
				</Button>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center gap-4'>
					<Avatar className='h-12 w-12'>
						<AvatarImage src={order.client?.avatar || '/placeholder.svg'} />
						<AvatarFallback>
							{(order.client?.name ?? order.client?.fullName ?? '')
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className='font-medium'>{clientName}</p>
						<p className='text-sm text-muted-foreground'>
							{t('orders.generalInfo.clientId')}: {client.id}
						</p>
					</div>
				</div>
				<Separator />
				<div className='space-y-2'>
					{client.email && (
						<div className='flex items-center gap-2'>
							<Mail className='h-4 w-4 text-muted-foreground' />
							<a
								href={`mailto:${client.email}`}
								className='text-sm hover:underline'
							>
								{client.email}
							</a>
						</div>
					)}
					<div className='flex items-center gap-2'>
						<Phone className='h-4 w-4 text-muted-foreground' />
						<a href={`tel:${client.phone}`} className='text-sm hover:underline'>
							{client.phone}
						</a>
					</div>
				</div>
				{client.address && (
					<>
						<Separator />
						<div>
							<p className='text-sm text-muted-foreground'>
								{t('orders.generalInfo.address')}
							</p>
							<p className='text-sm'>{client.address}</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
