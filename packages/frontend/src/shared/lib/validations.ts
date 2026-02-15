import {
	getFiltersStateParser,
	getSortingStateParser,
} from '@/shared/lib/parsers';
import { parseAsInteger, parseAsStringEnum } from 'nuqs/server';

export const getSearchParamsParsers = <T>() => ({
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(10),
	sort: getSortingStateParser<T>().withDefault([]),
	filters: getFiltersStateParser<T>().withDefault([]),
	joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
});
