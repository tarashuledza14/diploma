import { getAccessToken, removeFromStorage } from '@/modules/auth';
import axios, { type CreateAxiosDefaults } from 'axios';
import { getContentType } from './api.helper';
import { errorCatch } from './error';

const options: CreateAxiosDefaults = {
	baseURL: 'http://localhost:4200/api',
	headers: getContentType(),
	withCredentials: true,
};

export const instance = axios.create(options);

instance.interceptors.request.use(async config => {
	const accessToken = getAccessToken();

	if (config.headers && accessToken)
		config.headers.Authorization = `Bearer ${accessToken}`;

	return config;
});

instance.interceptors.response.use(
	config => config,
	async error => {
		const originalRequest = error.config;

		if (
			(error.response.status === 401 ||
				errorCatch(error) === 'jwt expired' ||
				errorCatch(error) === 'jwt must be provided') &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true;
			try {
				// await AuthService.getNewTokens()
				return instance.request(originalRequest);
			} catch (error) {
				if (errorCatch(error) === 'jwt expired') {
				}
				removeFromStorage();
			}
		}
	},
);
