import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Car, Edit } from 'lucide-react';

interface Props {
	order: any;
}
export function VehicleInfo({ order }: Props) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<Car className='h-5 w-5' />
					Vehicle Information
				</CardTitle>
				<Button variant='ghost' size='sm'>
					<Edit className='mr-2 h-4 w-4' />
					Edit
					{/* TODO: Open EditVehicleModal */}
				</Button>
			</CardHeader>
			<CardContent className='grid gap-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-sm text-muted-foreground'>Make</p>
						<p className='font-medium'>{order.vehicle.make}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Model</p>
						<p className='font-medium'>{order.vehicle.model}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Year</p>
						<p className='font-medium'>{order.vehicle.year}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Color</p>
						<p className='font-medium'>{order.vehicle.color}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>License Plate</p>
						<p className='font-medium'>{order.vehicle.plate}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Mileage</p>
						<p className='font-medium'>
							{order.vehicle.mileage.toLocaleString()} km
						</p>
					</div>
				</div>
				<Separator />
				<div>
					<p className='text-sm text-muted-foreground'>VIN</p>
					<p className='font-mono text-sm'>{order.vehicle.vin}</p>
				</div>
			</CardContent>
		</Card>
	);
}
