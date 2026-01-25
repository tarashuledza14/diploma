import { User } from '@shared';

export interface ITokens {
	accessToken: string;
}

export interface IAuthResponse extends ITokens {
	user: User;
}
export interface ILogin {
	email: string;
	password: string;
}
export interface IRegister extends ILogin {
	name: string;
}
export type IAuthForm = ILogin | IRegister;
