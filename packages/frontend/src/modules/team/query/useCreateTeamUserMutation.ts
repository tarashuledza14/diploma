import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../api/team.service';
import { CreateTeamUserPayload } from '../interfaces/team-user.interface';
import { teamKeys } from '../queries/keys';

export function useCreateTeamUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: teamKeys.mutations.create(),
		mutationFn: (payload: CreateTeamUserPayload) =>
			TeamService.createUser(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamKeys.users() });
		},
	});
}
