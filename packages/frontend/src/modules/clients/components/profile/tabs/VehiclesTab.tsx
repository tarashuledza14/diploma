import { Badge, Card, CardContent, ScrollArea } from '@/shared/components/ui';
import { Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VehiclesTabProps {
	mockClientVehicles: any[];
}

export function VehiclesTab({ mockClientVehicles }: VehiclesTabProps) {
	const { t } = useTranslation();

	const getVehicleStatusLabel = (value: unknown) => {
		const raw = String(value ?? '').toLowerCase();
		if (raw === 'active') {
			return t('services.status.active');
		}
		if (raw === 'inactive') {
			return t('services.status.inactive');
		}

		return String(value ?? '-');
	};

	return (
		<ScrollArea className='h-50'>
			<div className='space-y-2 pr-4'>
				{mockClientVehicles.map(vehicle => (
					<Card key={vehicle.id}>
						<CardContent className='p-3 flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center'>
									<Car className='h-5 w-5' />
								</div>
								<div>
									<p className='font-medium'>
										{vehicle.year} {vehicle.make} {vehicle.model}
									</p>
									<p className='text-sm text-muted-foreground'>
										{vehicle.plate}
									</p>
								</div>
							</div>
							<Badge
								className={
									vehicle.status === 'active'
										? 'bg-green-100 text-green-700'
										: 'bg-gray-100 text-gray-700'
								}
							>
								{getVehicleStatusLabel(vehicle.status)}
							</Badge>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}
