import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../api/team.service';
import { UpdateTeamUserPayload } from '../interfaces/team-user.interface';
import { teamKeys } from '../queries/keys';

export function useUpdateTeamUserMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: teamKeys.mutations.update(),
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: UpdateTeamUserPayload;
		}) => TeamService.updateUser(userId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamKeys.users() });
		},
	});
}
