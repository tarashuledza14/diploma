import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DispatchService } from '../api/dispatch.service';
import { AssignDispatchTaskPayload } from '../interfaces/dispatch-board.interface';
import { dispatchKeys } from '../queries/keys';

export function useAssignDispatchTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: dispatchKeys.mutations.assignTask(),
		mutationFn: (payload: AssignDispatchTaskPayload) =>
			DispatchService.assignTask(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: dispatchKeys.board() });
		},
	});
}
