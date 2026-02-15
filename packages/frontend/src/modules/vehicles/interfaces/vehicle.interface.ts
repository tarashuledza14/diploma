import { VehicleStatus } from '../enums/vehicle-status.enum';

export interface Vehicle {
	id: string;
	vin: string;
	brand: string;
	model: string;
	year: number;
	plateNumber: string | null;
	mileage: number;
	ownerId: string;
	lastService: Date | null;
	color: string | null;
	status: VehicleStatus;
	totalServices: number;
	deletedAt: Date | null;
	createdAt: Date;
}
