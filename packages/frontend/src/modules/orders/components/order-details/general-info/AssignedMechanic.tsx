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

interface Props {
	order: any;
}
export function AssignedMechanic({ order }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Wrench className='h-5 w-5' />
					Assigned Mechanic
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Avatar className='h-10 w-10'>
							<AvatarImage
								src={order.assignedTo.avatar || '/placeholder.svg'}
							/>
							<AvatarFallback>
								{order.assignedTo.name
									.split(' ')
									// .map(n => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className='font-medium'>{order.assignedTo.name}</p>
							<p className='text-sm text-muted-foreground'>
								{order.assignedTo.specialty}
							</p>
						</div>
					</div>
					<Button variant='outline' size='sm'>
						Reassign
						{/* TODO: Open AssignMechanicModal */}
					</Button>
				</div>
				<Separator className='my-4' />
				<div>
					<p className='mb-2 text-sm font-medium'>Notes</p>
					<p className='text-sm text-muted-foreground'>{order.notes}</p>
				</div>
			</CardContent>
		</Card>
	);
}
