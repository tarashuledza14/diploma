import { instance } from '@/api';
import { GetServicesParams } from '../interfaces/get-services.interface';

export class ServicesService {
	static async getAll(data: GetServicesParams) {
		const response = await instance.get('/services', { params: data });
		return response.data;
	}
}
