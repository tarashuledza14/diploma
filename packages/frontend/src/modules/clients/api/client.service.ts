import { instance } from '@/api';
import { CreateClientData } from '../interfaces/create-client.interface';
import { GetClientDetailsResponse } from '../interfaces/get-client-details.interface';
import {
	GetClientsParams,
	GetClientsResponse,
} from '../interfaces/get-client.interface';

export class ClientService {
	private static prefix: string = 'clients';

	static async getClients(params?: GetClientsParams) {
		const response = await instance.get<GetClientsResponse>(`${this.prefix}`, {
			params,
		});
		return response.data;
	}
	static async createClient(data: CreateClientData) {
		const response = await instance.post<{ id: string }>(
			`${this.prefix}`,
			data,
		);
		return response.data;
	}
	static async deleteClient(clientId: string) {
		await instance.delete(`${this.prefix}/${clientId}`);
	}
	static async updateClient(clientId: string, data: Partial<CreateClientData>) {
		const response = await instance.put(`${this.prefix}/${clientId}`, data);
		return response.data;
	}
	static async getClientDetails(clientId: string) {
		const response = await instance.get<GetClientDetailsResponse>(
			`${this.prefix}/${clientId}`,
		);
		return response.data;
	}
	static async deleteClientsBulk(clientIds: string[]) {
		await instance.delete(`${this.prefix}`, {
			data: { ids: clientIds },
		});
	}
}
