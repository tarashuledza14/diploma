import { VehicleStatus } from '../enums/vehicle-status.enum';

export interface AddVehicleData {
	ownerId: string;
	brand: string;
	model: string;
	year: number;
	color: string;
	plateNumber: string;
	vin: string;
	mileage: string;
	status: VehicleStatus;
	notes: string;
}
