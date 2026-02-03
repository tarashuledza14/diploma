import { instance } from '@/api';
import { Client } from '../interfaces/client.interface';

export interface GetClientsParams {
	page: number;
	perPage: number;
	sort?: Array<{ id: string; desc?: boolean }>;
	fullName?: string;
	email?: string;
	phone?: string;
	filters?: Array<{ id: string; value: string; operator?: string }>;
	joinOperator?: 'and' | 'or';
}

export interface GetClientsResponse {
	data: Client[];
	pageCount: number;
	total: number;
}

export class ClientService {
	private static prefix: string = 'clients';

	static async getClients(
		params: GetClientsParams,
	): Promise<GetClientsResponse> {
		const response = await instance.get<GetClientsResponse>(`${this.prefix}`, {
			params,
		});
		return response.data;
	}
}
