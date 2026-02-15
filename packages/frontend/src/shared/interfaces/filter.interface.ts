import { ExtendedColumnFilter, ExtendedColumnSort } from '@/types/data-table';

export interface PaginationFilterSortOptions<T> {
	filters: ExtendedColumnFilter<T>[];
	page: number;
	perPage: number;
	joinOperator?: NonNullable<'and' | 'or' | null>;
	sort?: ExtendedColumnSort<T>[];
}
