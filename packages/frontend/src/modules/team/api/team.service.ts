import { instance } from '@/api';
import {
	CreateTeamUserPayload,
	CreateTeamUserResponse,
	GetTeamUsersParams,
	TeamUsersResponse,
	UpdateTeamUserPayload,
} from '../interfaces/team-user.interface';

export class TeamService {
	private static prefix = 'team/users';

	static async getUsers(params?: GetTeamUsersParams) {
		const response = await instance.get<TeamUsersResponse>(this.prefix, {
			params,
		});
		return response.data;
	}

	static async createUser(payload: CreateTeamUserPayload) {
		const response = await instance.post<CreateTeamUserResponse>(
			this.prefix,
			payload,
		);
		return response.data;
	}

	static async updateUser(userId: string, payload: UpdateTeamUserPayload) {
		const response = await instance.patch(`${this.prefix}/${userId}`, payload);
		return response.data;
	}

	static async blockUser(userId: string) {
		const response = await instance.delete(`${this.prefix}/${userId}`);
		return response.data;
	}
}
