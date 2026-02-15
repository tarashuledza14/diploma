import { Client, clientKeys, ClientService } from '@/modules/clients';
import { PaginationFilterSortOptions } from '@/shared';
import { useQuery } from '@tanstack/react-query';

export function useClientsQuery(
	searchParams?: PaginationFilterSortOptions<Client>,
) {
	return useQuery({
		queryKey: clientKeys.list(searchParams),
		queryFn: () => ClientService.getClients(searchParams),
		placeholderData: previousData => previousData,
	});
}
