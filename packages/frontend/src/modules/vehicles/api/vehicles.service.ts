import { instance } from '@/api';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';
import {
	GetVehicleParams,
	GetVehicleResponse,
} from '../interfaces/get-vehicle.interface';
import { StatusCounts } from '../interfaces/status-counts.interface';
import { UpdateBulkVehiclesDto } from '../interfaces/update-bulk-vehicle.interface';

export class VehicleService {
	private static prefix: string = 'vehicles';

	static async add(vehicleData: AddVehicleData) {
		const response = await instance.post(`${this.prefix}`, vehicleData);
		return response.data;
	}

	static async getAll(params: GetVehicleParams) {
		const response = await instance.get<GetVehicleResponse>(`${this.prefix}`, {
			params,
		});
		return response.data;
	}
	static async getStatusCounts() {
		const response = await instance.get<StatusCounts>(
			`${this.prefix}/status-counts`,
		);
		return response.data;
	}

	static async deleteVehicle(id: string) {
		const response = await instance.delete(`${this.prefix}/${id}`);
		return response.data;
	}
	static async deleteVehiclesBulk(ids: string[]) {
		const response = await instance.delete(`${this.prefix}/bulk`, {
			data: { ids },
		});
		return response.data;
	}
	static async updateVehicle(id: string, data: Partial<AddVehicleData>) {
		const response = await instance.patch(`${this.prefix}/${id}`, data);
		return response.data;
	}
	static async updateVehicleBulk(data: UpdateBulkVehiclesDto): Promise<any> {
		const response = await instance.patch(`${this.prefix}/bulk`, data);
		return response.data;
	}
}
