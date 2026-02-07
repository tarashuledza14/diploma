import {
	clientKeys,
	ClientService,
	ClientsHeader,
	ClientTable,
} from '@/modules/clients';
import { getValidFilters, searchParamsParsers } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';

export function ClientsPage() {
	const [search] = useQueryStates(searchParamsParsers);

	const validFilters = getValidFilters(search.filters);

	const searchParams = {
		...search,
		filters: validFilters,
	};

	const { data, isLoading } = useQuery({
		queryKey: clientKeys.list(searchParams),
		queryFn: () => ClientService.getClients(searchParams),
		placeholderData: previousData => previousData,
	});

	return (
		<div className='flex flex-col gap-6'>
			<ClientsHeader />
			<ClientTable
				data={data?.data ?? []}
				pageCount={data?.pageCount ?? 0}
				isLoading={isLoading}
			/>
		</div>
	);
}
