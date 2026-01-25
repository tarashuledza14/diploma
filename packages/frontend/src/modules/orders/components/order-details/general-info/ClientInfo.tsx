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

interface Props {
	order: any;
}
export function ClientInfo({ order }: Props) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<User className='h-5 w-5' />
					Client Information
				</CardTitle>
				<Button variant='ghost' size='sm'>
					<Edit className='mr-2 h-4 w-4' />
					Edit
					{/* TODO: Open EditClientModal or navigate to /clients/:id */}
				</Button>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center gap-4'>
					<Avatar className='h-12 w-12'>
						<AvatarImage src={order.client.avatar || '/placeholder.svg'} />
						<AvatarFallback>
							{order.client.name
								.split(' ')
								// .map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className='font-medium'>{order.client.name}</p>
						<p className='text-sm text-muted-foreground'>
							Client ID: {order.client.id}
						</p>
					</div>
				</div>
				<Separator />
				<div className='space-y-2'>
					<div className='flex items-center gap-2'>
						<Mail className='h-4 w-4 text-muted-foreground' />
						<a
							href={`mailto:${order.client.email}`}
							className='text-sm hover:underline'
						>
							{order.client.email}
						</a>
					</div>
					<div className='flex items-center gap-2'>
						<Phone className='h-4 w-4 text-muted-foreground' />
						<a
							href={`tel:${order.client.phone}`}
							className='text-sm hover:underline'
						>
							{order.client.phone}
						</a>
					</div>
				</div>
				<Separator />
				<div>
					<p className='text-sm text-muted-foreground'>Address</p>
					<p className='text-sm'>{order.client.address}</p>
				</div>
			</CardContent>
		</Card>
	);
}
