import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';
import { AddService } from './AddService';
import { ServiceTable } from './ServiceTable';
import { ServicesTotals } from './ServicesTotals';

interface ServicesTabProps {
	services: any[];
	servicesTotal: number;
	serviceOptions: Array<{ id: string; name: string; price: number }>;
	onAddService: (serviceId: string) => Promise<void>;
	onRemoveService: (serviceRowId: string) => Promise<void>;
	canManageServices?: boolean;
	showFinancials?: boolean;
	isUpdating?: boolean;
}

export function ServicesTab({
	services,
	servicesTotal,
	serviceOptions,
	onAddService,
	onRemoveService,
	canManageServices = true,
	showFinancials = true,
	isUpdating = false,
}: ServicesTabProps) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>
					{t('orders.detailsTabs.services', { count: services.length })}
				</CardTitle>
				{canManageServices && (
					<AddService
						serviceOptions={serviceOptions}
						onAddService={onAddService}
						isPending={isUpdating}
					/>
				)}
			</CardHeader>

			<CardContent>
				<ServiceTable
					services={services}
					onRemoveService={onRemoveService}
					canManageServices={canManageServices}
					showFinancials={showFinancials}
					isPending={isUpdating}
				/>
				{showFinancials && (
					<>
						<Separator className='my-4' />
						<ServicesTotals servicesTotal={servicesTotal} />
					</>
				)}
			</CardContent>
		</Card>
	);
}
