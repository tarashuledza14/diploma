import {
	Client,
	ClientsHeader,
	ClientTable,
	useClientsQuery,
} from '@/modules/clients';
import {
	getSearchParamsParsers,
	getValidFilters,
	PaginationFilterSortOptions,
} from '@/shared';
import { useQueryStates } from 'nuqs';

export function ClientsPage() {
	const [search] = useQueryStates(getSearchParamsParsers());

	const validFilters = getValidFilters(search.filters);

	const searchParams: PaginationFilterSortOptions<Client> = {
		...search,
		filters: validFilters,
	};
	console.log('fil', JSON.stringify(searchParams));
	const { data, isLoading } = useClientsQuery(searchParams);

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
