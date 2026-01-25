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
}

export function ServicesTab({ services, servicesTotal }: ServicesTabProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>Services</CardTitle>
				<AddService />
			</CardHeader>

			<CardContent>
				<ServiceTable services={services} />
				<Separator className='my-4' />
				<ServicesTotals servicesTotal={servicesTotal} />
			</CardContent>
		</Card>
	);
}
