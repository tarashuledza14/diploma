import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DispatchService } from '../api/dispatch.service';
import { UpdateDispatchTaskPlanningPayload } from '../interfaces/dispatch-board.interface';
import { dispatchKeys } from '../queries/keys';

export function useUpdateDispatchTaskPlanningMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: dispatchKeys.mutations.updateTaskPlanning(),
		mutationFn: (payload: UpdateDispatchTaskPlanningPayload) =>
			DispatchService.updateTaskPlanning(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: dispatchKeys.board() });
		},
	});
}
