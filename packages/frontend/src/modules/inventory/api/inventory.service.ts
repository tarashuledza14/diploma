import { instance } from '@/api';
import { GetInventoryParams } from '../interfaces/get-inventory.interfaces';

export class InventoryService {
	static prefix = 'inventory';
	static async getAll(searchParams: GetInventoryParams) {
		console.log('searchParams', searchParams);
		const response = await instance.get(`/${this.prefix}`, {
			params: searchParams,
		});
		return response.data;
	}

	static async getAllDictionaries() {
		const response = await instance.get(`/${this.prefix}/dictionaries`);
		return response.data;
	}
}
