import {
	getAccessToken,
	removeFromStorage,
	saveToStorage,
} from '@/modules/auth';
import { IAuthResponse } from '@/modules/auth/interfaces/auth.interfaces';
import axios, { type CreateAxiosDefaults } from 'axios';
import { getContentType } from './api.helper';
import { errorCatch } from './error';

const options: CreateAxiosDefaults = {
	baseURL: 'http://localhost:4200/api',
	headers: getContentType(),
	withCredentials: true,
};

export const instance = axios.create(options);

let refreshPromise: Promise<IAuthResponse> | null = null;

const refreshAccessToken = async () => {
	if (!refreshPromise) {
		refreshPromise = instance
			.post<IAuthResponse>('/auth/access-token')
			.then(response => {
				saveToStorage(response.data);
				return response.data;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
};

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
		const status = error?.response?.status;
		const requestUrl = originalRequest?.url || '';
		const isRefreshRequest = requestUrl.includes('/auth/access-token');

		if (isRefreshRequest) {
			removeFromStorage();
			return Promise.reject(error);
		}

		if (
			(status === 401 ||
				errorCatch(error) === 'jwt expired' ||
				errorCatch(error) === 'jwt must be provided') &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true;
			try {
				await refreshAccessToken();
				return instance.request(originalRequest);
			} catch (refreshError) {
				removeFromStorage();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);
