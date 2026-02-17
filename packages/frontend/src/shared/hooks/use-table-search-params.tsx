import { useQueryStates } from 'nuqs';
import { getSearchParamsParsers, getValidFilters } from '../lib';

export const useTableSearchParams = () => {
	const [search] = useQueryStates(getSearchParamsParsers());

	const validFilters = getValidFilters(search.filters);

	return {
		...search,
		filters: validFilters,
	};
};
