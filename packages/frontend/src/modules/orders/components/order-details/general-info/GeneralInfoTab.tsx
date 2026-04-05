import { AssignedMechanic } from './AssignedMechanic';
import { ClientInfo } from './ClientInfo';
import { OrderTimeline } from './OrderTimeline';
import { VehicleInfo } from './VehicleInfo';

interface GeneralInfoTabProps {
	order: any;
	onEditClient?: () => void;
	onEditVehicle?: () => void;
	canEdit?: boolean;
	mechanics?: Array<{
		id: string;
		name: string;
		specialty?: string;
	}>;
}

export function GeneralInfoTab({
	order,
	onEditClient,
	onEditVehicle,
	canEdit = true,
	mechanics = [],
}: GeneralInfoTabProps) {
	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			<VehicleInfo
				order={order}
				onEditClick={onEditVehicle}
				canEdit={canEdit}
			/>
			<ClientInfo order={order} onEditClick={onEditClient} canEdit={canEdit} />
			<OrderTimeline order={order} />
			<AssignedMechanic order={order} mechanics={mechanics} />
		</div>
	);
}
