import { useQuery } from '@tanstack/react-query';
import { TeamService } from '../api/team.service';
import { teamKeys } from '../queries/keys';

export function useTeamUsersQuery() {
	return useQuery({
		queryKey: teamKeys.users(),
		queryFn: () => TeamService.getUsers(),
		placeholderData: previousData => previousData,
	});
}
