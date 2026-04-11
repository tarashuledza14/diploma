import { useQuery } from '@tanstack/react-query';
import { TeamService } from '../api/team.service';
import { GetTeamUsersParams } from '../interfaces/team-user.interface';
import { teamKeys } from '../queries/keys';

export function useTeamUsersQuery(searchParams?: GetTeamUsersParams) {
	return useQuery({
		queryKey: teamKeys.list(searchParams),
		queryFn: () => TeamService.getUsers(searchParams),
		placeholderData: previousData => previousData,
	});
}
