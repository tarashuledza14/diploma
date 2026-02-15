import { VehicleStatus } from '../enums/vehicle-status.enum';

export const vehicleStatusInfo: Record<
	VehicleStatus,
	{ label: string; variant: 'success' | 'warning' | 'info' | 'default' }
> = {
	[VehicleStatus.OUT]: { label: 'Out', variant: 'default' },
	[VehicleStatus.PENDING]: { label: 'Pending', variant: 'warning' },
	[VehicleStatus.IN_SERVICE]: { label: 'In Service', variant: 'info' },
	[VehicleStatus.TEST_DRIVE]: { label: 'Test Drive', variant: 'info' },
	[VehicleStatus.READY]: { label: 'Ready', variant: 'success' },
};

export const vehicleStatusOptions = Object.entries(vehicleStatusInfo).map(
	([value, info]) => ({
		value: value as VehicleStatus,
		label: info.label,
	}),
);
