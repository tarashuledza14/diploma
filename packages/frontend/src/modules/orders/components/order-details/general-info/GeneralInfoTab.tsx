import { AssignedMechanic } from './AssignedMechanic';
import { ClientInfo } from './ClientInfo';
import { OrderTimeline } from './OrderTimeline';
import { VehicleInfo } from './VehicleInfo';

interface GeneralInfoTabProps {
	order: any;
}

export function GeneralInfoTab({ order }: GeneralInfoTabProps) {
	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			<VehicleInfo order={order} />
			<ClientInfo order={order} />
			<OrderTimeline order={order} />
			<AssignedMechanic order={order} />
		</div>
	);
}
