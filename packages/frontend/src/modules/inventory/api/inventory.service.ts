import { instance } from '@/api';
import {
	GetInventoryParams,
	MovementHistoryResponse,
} from '../interfaces/get-inventory.interfaces';
import {
	InventoryDictionaries,
	InventoryPart,
	InventoryStats,
} from '../interfaces/inventory.interfaces';

export class InventoryService {
	static prefix = '/inventory';

	static async getAll(searchParams: GetInventoryParams) {
		const response = await instance.get<{
			data: InventoryPart[];
			total: number;
			pageCount: number;
		}>(`${this.prefix}`, {
			params: searchParams,
		});
		return response.data;
	}

	static async getAllDictionaries() {
		const response = await instance.get<InventoryDictionaries>(
			`${this.prefix}/dictionaries`,
		);
		return response.data;
	}

	// Створення нової запчастини
	static async createPart(data: Partial<InventoryPart>) {
		const response = await instance.post<InventoryPart>(`${this.prefix}`, data);
		return response.data;
	}

	// Оновлення запчастини
	static async updatePart(data: Partial<InventoryPart>) {
		// Краще передавати ID в URL, як це зазвичай робиться в REST: /inventory/parts/:id
		const response = await instance.put<InventoryPart>(`${this.prefix}`, data);
		return response.data;
	}

	static async getStats() {
		const response = await instance.get<InventoryStats>(`${this.prefix}/stats`);
		return response.data;
	}
	static async getMovementHistory(partId: string) {
		const response = await instance.get<MovementHistoryResponse>(
			`${this.prefix}/movement-history/${partId}`,
		);
		return response.data;
	}
	static async deleteBulk(ids: string[]) {
		const response = await instance.delete(`${this.prefix}/bulk`, {
			data: { ids },
		});
		return response.data;
	}
}
