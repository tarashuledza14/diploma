import { Role } from 'prisma/generated/prisma/client';

export interface AuthUser {
	id: string;
	email: string;
	fullName: string;
	role: Role;
}
