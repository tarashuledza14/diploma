import { UserRole } from '@/shared/interfaces/user.interface';

export type TeamAccountStatus = 'ACTIVE' | 'PENDING_CONFIRMATION' | 'BLOCKED';

export interface TeamUser {
	id: string;
	email: string;
	fullName: string;
	role: UserRole;
	createdAt: string;
	deletedAt: string | null;
	accountStatus: TeamAccountStatus;
	openOrdersCount: number;
	isSelf: boolean;
}

export interface TeamUsersResponse {
	data: TeamUser[];
}

export interface CreateTeamUserPayload {
	email: string;
	fullName?: string;
	role: UserRole;
}

export interface UpdateTeamUserPayload {
	fullName?: string;
	role?: UserRole;
}

export interface CreateTeamUserResponse extends TeamUser {
	temporaryPassword: string;
}
