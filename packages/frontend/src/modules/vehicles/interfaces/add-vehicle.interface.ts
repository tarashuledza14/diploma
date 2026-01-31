import { type VehicleStatusType } from '../enums/vehicle-status.enum';

export interface AddVehicleData {
	ownerId: string;
	brand: string;
	model: string;
	year: string;
	color: string;
	plate: string;
	vin: string;
	mileage: string;
	status: VehicleStatusType;
	notes: string;
}
