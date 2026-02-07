import { ExtendedColumnFilter, ExtendedColumnSort } from '@/types/data-table';
import { Client } from './client.interface';

export interface GetClientsParams {
	filters: ExtendedColumnFilter<Client>[];
	page: number;
	perPage: number;
	sort: ExtendedColumnSort<Client>[];
	fullName: string;
	email: string;
	phone: string;
	joinOperator: NonNullable<'and' | 'or' | null>;
}

export interface GetClientsResponse {
	data: Client[];
	pageCount: number;
	total: number;
}
