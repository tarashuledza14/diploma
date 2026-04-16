import Cookies from 'js-cookie';
import { IAuthResponse, ITokens } from '../interfaces/auth.interfaces';
import { EnumToken } from './auth.enum';

const ACCESS_TOKEN_EXPIRES_DAYS = 7;

const getAccessTokenCookieOptions = () => ({
	expires: ACCESS_TOKEN_EXPIRES_DAYS,
	path: '/',
	sameSite: 'lax' as const,
	secure:
		typeof window !== 'undefined' && window.location.protocol === 'https:',
});

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

export const saveTokensStorage = (data: ITokens) => {
	Cookies.set(
		EnumToken.ACCESS_TOKEN,
		data.accessToken,
		getAccessTokenCookieOptions(),
	);
};

export const removeFromStorage = () => {
	Cookies.remove(EnumToken.ACCESS_TOKEN, { path: '/' });
	localStorage.removeItem(EnumToken.USER);
};

export const saveToStorage = (data: IAuthResponse) => {
	saveTokensStorage(data);
	localStorage.setItem(EnumToken.USER, JSON.stringify(data.user));
};
