import { instance } from '@/api';
import {
	AppBranding,
	UpdateAppBrandingPayload,
} from '../interfaces/branding.interface';

export class AppSettingsService {
	private static readonly prefix = '/app-settings';

	static async getBranding() {
		const response = await instance.get<AppBranding>(`${this.prefix}/branding`);
		return response.data;
	}

	static async updateBranding(payload: UpdateAppBrandingPayload) {
		const response = await instance.patch<AppBranding>(
			`${this.prefix}/branding`,
			payload,
		);
		return response.data;
	}

	static async uploadLogo(file: File) {
		const formData = new FormData();
		formData.append('file', file);

		const response = await instance.post<AppBranding>(
			`${this.prefix}/logo`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		);

		return response.data;
	}
}
