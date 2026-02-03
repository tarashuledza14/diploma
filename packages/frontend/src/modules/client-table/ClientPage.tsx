import { getValidFilters } from '@/shared/lib/data-table';
import { useQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';
import { ClientService } from '../clients/api/client.service';
import { ClientTable } from './ClientTable';
import { searchParamsParsers } from './validations';

export function ClientPageDemo() {
	const [search] = useQueryStates(searchParamsParsers);

	const validFilters = getValidFilters(search.filters);

	const searchParams = {
		...search,
		filters: validFilters,
	};

	const { data, isLoading } = useQuery({
		queryKey: ['clients', searchParams],
		queryFn: () => ClientService.getClients(searchParams),
		placeholderData: previousData => previousData,
	});

	return (
		<ClientTable
			data={data?.data ?? []}
			pageCount={data?.pageCount ?? 0}
			isLoading={isLoading}
		/>
	);
}
