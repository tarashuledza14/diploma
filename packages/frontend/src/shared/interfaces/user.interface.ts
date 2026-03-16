export type UserRole = 'ADMIN' | 'MANAGER' | 'MECHANIC';

export interface User {
	id: string;
	fullName: string;
	email: string;
	role: UserRole;
	roles?: UserRole;
}
