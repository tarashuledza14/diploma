import { useQuery } from '@tanstack/react-query';
import { DispatchService } from '../api/dispatch.service';
import { dispatchKeys } from '../queries/keys';

export function useDispatchBoardQuery() {
	return useQuery({
		queryKey: dispatchKeys.board(),
		queryFn: () => DispatchService.getBoard(),
	});
}
