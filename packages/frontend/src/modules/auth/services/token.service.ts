import Cookies from 'js-cookie';
import { IAuthResponse, ITokens } from '../interfaces/auth.interfaces';
import { EnumToken } from './auth.enum';

export const getAccessToken = () => {
	const accessToken = Cookies.get(EnumToken.ACCESS_TOKEN);
	return accessToken || null;
};
export const getUser = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	const user = localStorage.getItem(EnumToken.USER);
	if (!user) {
		return null;
	}

	try {
		return JSON.parse(user);
	} catch {
		return null;
	}
};
export const getRefreshToken = () => {
	const refreshToken = Cookies.get(EnumToken.REFRESH_TOKEN);
	return refreshToken || null;
};
export const saveTokensStorage = (data: ITokens) => {
	Cookies.set(EnumToken.ACCESS_TOKEN, data.accessToken);
	//Cookies.set(EnumToken.REFRESH_TOKEN, data.refreshToken)
};
export const removeFromStorage = () => {
	Cookies.remove(EnumToken.ACCESS_TOKEN);
	//Cookies.remove(EnumToken.REFRESH_TOKEN)
	localStorage.removeItem(EnumToken.USER);
};

export const saveToStorage = (data: IAuthResponse) => {
	saveTokensStorage(data);
	localStorage.setItem(EnumToken.USER, JSON.stringify(data.user));
};
