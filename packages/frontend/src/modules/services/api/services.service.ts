import { instance } from '@/api';
import {
	GetServicesParams,
	GetServicesResponse,
} from '../interfaces/get-services.interface';
import {
	Service,
	ServiceDictionaries,
} from '../interfaces/services.interface';

export class ServicesService {
	private static prefix = '/services';

	static async getAll(data: GetServicesParams) {
		const response = await instance.get<GetServicesResponse>(this.prefix, {
			params: data,
		});
		return response.data;
	}

	static async getDictionaries() {
		const response = await instance.get<ServiceDictionaries>(
			`${this.prefix}/dictionaries`,
		);
		return response.data;
	}

	static async update(data: {
		id: string;
		name?: string;
		description?: string;
		price?: number;
		estimatedTime?: number;
		status?: boolean;
		categoryId?: string | null;
		requiredCategoryIds?: string[];
	}) {
		const response = await instance.put<Service>(this.prefix, data);
		return response.data;
	}

	static async create(data: {
		name: string;
		description: string;
		price: number;
		estimatedTime: number;
		status: boolean;
		categoryId?: string;
		requiredCategoryIds?: string[];
	}) {
		const response = await instance.post<Service>(this.prefix, data);
		return response.data;
	}

	static async delete(id: string) {
		await instance.delete(`${this.prefix}/${id}`);
	}

	static async deleteBulk(ids: string[]) {
		await instance.delete(`${this.prefix}/bulk`, {
			data: { ids },
		});
	}

	static async updateBulkStatus(ids: string[], status: boolean) {
		await instance.patch(`${this.prefix}/bulk`, { ids, status });
	}
}

