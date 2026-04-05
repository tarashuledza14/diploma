import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Car, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	order: any;
	onEditClick?: () => void;
	canEdit?: boolean;
}
export function VehicleInfo({ order, onEditClick, canEdit = true }: Props) {
	const { t } = useTranslation();
	const vehicle = order.vehicle;
	if (!vehicle) return null;

	const make = vehicle.make ?? vehicle.brand;
	const plate = vehicle.plate ?? vehicle.plateNumber;
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<Car className='h-5 w-5' />
					{t('orders.generalInfo.vehicleInformation')}
				</CardTitle>
				{canEdit && (
					<Button variant='ghost' size='sm' onClick={onEditClick}>
						<Edit className='mr-2 h-4 w-4' />
						{t('common.edit')}
					</Button>
				)}
			</CardHeader>
			<CardContent className='grid gap-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('orders.generalInfo.make')}
						</p>
						<p className='font-medium'>{make}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('orders.generalInfo.model')}
						</p>
						<p className='font-medium'>{vehicle.model}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('vehicles.fields.year')}
						</p>
						<p className='font-medium'>{vehicle.year}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('vehicles.fields.color')}
						</p>
						<p className='font-medium'>{vehicle.color ?? '—'}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('vehicles.fields.licensePlate')}
						</p>
						<p className='font-medium'>{plate ?? '—'}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							{t('vehicles.fields.mileageKm')}
						</p>
						<p className='font-medium'>
							{(vehicle.mileage ?? 0).toLocaleString()} km
						</p>
					</div>
				</div>
				<Separator />
				<div>
					<p className='text-sm text-muted-foreground'>
						{t('vehicles.fields.vin')}
					</p>
					<p className='font-mono text-sm'>{vehicle.vin ?? '—'}</p>
				</div>
			</CardContent>
		</Card>
	);
}
