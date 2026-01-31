import { instance } from '@/api';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';

export class VehicleService {
	private static prefix: string = 'vehicles';

	static async add(vehicleData: AddVehicleData) {
		const response = await instance.post(`${this.prefix}`, vehicleData);
		return response.data;
	}
}
