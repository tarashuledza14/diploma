import { PaginationFilterSortOptions } from '@/shared';
import { UserRole } from '@/shared/interfaces/user.interface';

export type TeamAccountStatus = 'ACTIVE' | 'PENDING_CONFIRMATION' | 'BLOCKED';
export type InviteLanguage = 'UK' | 'EN';

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
	pageCount: number;
	total: number;
}

export interface GetTeamUsersParams extends PaginationFilterSortOptions<TeamUser> {
	fullName?: string;
}

export interface CreateTeamUserPayload {
	email: string;
	fullName?: string;
	role: UserRole;
	language: InviteLanguage;
}

export interface UpdateTeamUserPayload {
	fullName?: string;
	role?: UserRole;
}

export interface CreateTeamUserResponse extends TeamUser {
	inviteEmailSent: boolean;
	inviteExpiresAt: string;
}
