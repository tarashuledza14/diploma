import { instance } from '@/api';
import {
	GetOrdersParams,
	GetOrdersResponse,
} from '../interfaces/get-orders.interface';
import { NewOrderMeta } from '../interfaces/new-order-meta.interface';
import { NewOrder } from '../interfaces/new-order.interface';

export type CreateOrderPayload = Omit<NewOrder, 'dueDate'> & {
	dueDate: string;
};

export type UpdateOrderPayload = NewOrder & {
	endDate?: string;
};

export class OrdersService {
	static async getAll(params: GetOrdersParams) {
		const response = await instance.get<GetOrdersResponse>('/orders', {
			params,
		});
		return response.data;
	}

	static async getById(id: string) {
		const response = await instance.get(`/orders/${id}`);
		return response.data;
	}

	static async getNewOrderMeta() {
		const response = await instance.get<NewOrderMeta>('/orders/meta/new');
		return response.data;
	}

	static createOrder(data: CreateOrderPayload) {
		return instance.post('/orders', data);
	}

	static updateOrder(id: string, data: UpdateOrderPayload) {
		return instance.patch(`/orders/${id}`, data);
	}

	static async quickUpdateOrder(
		id: string,
		data: { mechanicId?: string | null; endDate?: string | null },
	) {
		const response = await instance.patch(`/orders/${id}/quick`, data);
		return response.data;
	}

	static async updateBulk(
		ids: string[],
		data: { status?: string; priority?: string },
	) {
		return instance.patch('/orders/bulk', { ids, ...data });
	}

	static async deleteOrder(id: string) {
		return instance.delete(`/orders/${id}`);
	}

	static async deleteBulk(ids: string[]) {
		return instance.delete('/orders', {
			data: { ids },
		});
	}

	static async getRecommendedParts(vehicleId: string, serviceId: string) {
		const response = await instance.get('/orders/recommended-parts', {
			params: { vehicleId, serviceId },
		});
		return response.data;
	}
}
