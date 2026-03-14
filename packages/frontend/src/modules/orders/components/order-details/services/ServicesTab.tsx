import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { AddService } from './AddService';
import { ServiceTable } from './ServiceTable';
import { ServicesTotals } from './ServicesTotals';

interface ServicesTabProps {
	services: any[];
	servicesTotal: number;
	serviceOptions: Array<{ id: string; name: string; price: number }>;
	onAddService: (serviceId: string) => Promise<void>;
	onRemoveService: (serviceRowId: string) => Promise<void>;
	isUpdating?: boolean;
}

export function ServicesTab({
	services,
	servicesTotal,
	serviceOptions,
	onAddService,
	onRemoveService,
	isUpdating = false,
}: ServicesTabProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>Services</CardTitle>
				<AddService
					serviceOptions={serviceOptions}
					onAddService={onAddService}
					isPending={isUpdating}
				/>
			</CardHeader>

			<CardContent>
				<ServiceTable
					services={services}
					onRemoveService={onRemoveService}
					isPending={isUpdating}
				/>
				<Separator className='my-4' />
				<ServicesTotals servicesTotal={servicesTotal} />
			</CardContent>
		</Card>
	);
}
