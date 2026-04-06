import { instance } from '@/api';
import type {
	ManualItem,
	ManualOpenLinkResponse,
} from '../interfaces/manual.interface';

interface GetManualsParams {
	search?: string;
}

export class ManualsService {
	static async getAll(params?: GetManualsParams) {
		const response = await instance.get<ManualItem[]>('/manuals', {
			params,
		});
		return response.data;
	}

	static async uploadManual(file: File, carModel: string) {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('carModel', carModel);

		const response = await instance.post('/manuals/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data;
	}

	static async getOpenLink(id: string) {
		const response = await instance.get<ManualOpenLinkResponse>(
			`/manuals/${id}/open`,
		);
		return response.data;
	}
}
