import { instance } from '@/api';
import { GetInventoryParams } from '../interfaces/get-inventory.interfaces';
import {
	InventoryDictionaries,
	InventoryPart,
	InventoryStats,
} from '../interfaces/inventory.interfaces';

export class InventoryService {
	static prefix = 'inventory';
	static async getAll(searchParams: GetInventoryParams) {
		const response = await instance.get(`/${this.prefix}`, {
			params: searchParams,
		});
		return response.data;
	}

	static async getAllDictionaries() {
		const response = await instance.get<InventoryDictionaries>(
			`/${this.prefix}/dictionaries`,
		);
		return response.data;
	}

	static async updatePart(data: InventoryPart) {
		const response = await instance.put(`/${this.prefix}/parts`, data);
		return response.data;
	}

	static async getStats() {
		const response = await instance.get<InventoryStats>(
			`/${this.prefix}/stats`,
		);
		return response.data;
	}
	static async createPart(data: Partial<InventoryPart>) {}
}
