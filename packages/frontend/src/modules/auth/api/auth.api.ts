import { instance } from '@/api';
import { IAuthResponse } from '../interfaces/auth.interfaces';

export class AuthAPI {
	static PREFIX = '/auth';
	static async login(email: string, password: string) {
		const response = await instance.post<IAuthResponse>(
			`${this.PREFIX}/login`,
			{
				email,
				password,
			},
		);
		return response.data;
	}
}
