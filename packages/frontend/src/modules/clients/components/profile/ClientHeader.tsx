import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
} from '@/shared/components/ui';
import { Edit, Mail, Phone } from 'lucide-react';
import { GetClientDetailsResponse } from '../../interfaces/get-client-details.interface';

interface ClientHeaderProps {
	selectedClient: GetClientDetailsResponse;
	onEditClick: () => void;
}

export function ClientHeader({
	selectedClient,
	onEditClick,
}: ClientHeaderProps) {
	console.log('selectedClient', selectedClient);
	return (
		<div className='flex items-start gap-4 pb-4'>
			<Avatar className='h-16 w-16'>
				<AvatarImage src={selectedClient.avatar || '/placeholder.svg'} />
				<AvatarFallback className='text-lg'>
					{selectedClient.fullName
						.split(' ')
						.map((n: string) => n[0])
						.join('')}
				</AvatarFallback>
			</Avatar>
			<div className='flex-1'>
				<div className='flex items-center gap-2'>
					<h3 className='text-xl font-semibold'>{selectedClient.fullName}</h3>
				</div>
				<p className='text-sm text-muted-foreground'>{selectedClient.id}</p>
				<div className='flex flex-wrap gap-4 mt-2 text-sm'>
					<div className='flex items-center gap-1'>
						<Mail className='h-4 w-4 text-muted-foreground' />
						{selectedClient.email}
					</div>
					<div className='flex items-center gap-1'>
						<Phone className='h-4 w-4 text-muted-foreground' />
						{selectedClient.phone}
					</div>
					{/* {selectedClient.address && (
						<div className='flex items-center gap-1'>
							<MapPin className='h-4 w-4 text-muted-foreground' />
							{selectedClient.address}, {selectedClient.city}
						</div>
					)} */}
				</div>
			</div>
			<Button variant='outline' size='sm' onClick={onEditClick}>
				<Edit className='mr-2 h-4 w-4' />
				Edit
			</Button>
		</div>
	);
}
