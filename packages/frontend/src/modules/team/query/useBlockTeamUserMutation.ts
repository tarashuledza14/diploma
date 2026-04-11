import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../api/team.service';
import { teamKeys } from '../queries/keys';

export function useBlockTeamUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: teamKeys.mutations.block(),
		mutationFn: (userId: string) => TeamService.blockUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamKeys.users() });
		},
	});
}
