import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	order: any;
	mechanics?: Array<{
		id: string;
		name: string;
		specialty?: string;
	}>;
}

interface ServiceAssignmentView {
	key: string;
	serviceName: string;
	mechanicName?: string;
	mechanicSpecialty?: string;
}

export function AssignedMechanic({ order, mechanics = [] }: Props) {
	const { t } = useTranslation();

	const mechanicsById = new Map(
		mechanics.map(mechanic => [mechanic.id, mechanic]),
	);

	const serviceAssignments: ServiceAssignmentView[] = (
		order?.services ?? []
	).map((service: any, index: number) => {
		const mappedMechanic = service?.mechanicId
			? mechanicsById.get(service.mechanicId)
			: undefined;

		const serviceName =
			service?.name ??
			t('orders.newOrder.labels.serviceN', { index: index + 1 });

		const mechanicName =
			service?.mechanic?.name ??
			service?.assignedTo?.name ??
			service?.mechanicName ??
			mappedMechanic?.name;

		const mechanicSpecialty =
			service?.mechanic?.specialty ??
			service?.assignedTo?.specialty ??
			service?.mechanicSpecialty ??
			mappedMechanic?.specialty;

		return {
			key: String(service?.id ?? `${serviceName}-${index}`),
			serviceName,
			mechanicName,
			mechanicSpecialty,
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Wrench className='h-5 w-5' />
					{t('orders.generalInfo.assignedMechanic')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{serviceAssignments.length === 0 ? (
					<p className='text-sm text-muted-foreground'>
						{t('orders.newOrder.empty.noServices')}
					</p>
				) : (
					<div className='space-y-2'>
						{serviceAssignments.map(assignment => (
							<div key={assignment.key} className='rounded-md border p-3'>
								<p className='text-sm font-medium'>{assignment.serviceName}</p>
								<p className='mt-1 text-sm text-muted-foreground'>
									{assignment.mechanicName ??
										t('orders.newOrder.labels.noMechanicAssigned')}
								</p>
								{assignment.mechanicName && assignment.mechanicSpecialty && (
									<p className='text-xs text-muted-foreground'>
										{assignment.mechanicSpecialty}
									</p>
								)}
							</div>
						))}
					</div>
				)}
				{(order.notes ?? order.description) && (
					<>
						<Separator className='my-4' />
						<div>
							<p className='mb-2 text-sm font-medium'>{t('common.notes')}</p>
							<p className='text-sm text-muted-foreground'>
								{order.notes ?? order.description}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
