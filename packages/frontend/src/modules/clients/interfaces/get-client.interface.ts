import { PaginationFilterSortOptions } from '@/shared';
import { Client } from './client.interface';

export interface GetClientsParams extends PaginationFilterSortOptions<Client> {}

export interface GetClientsResponse {
	data: Client[];
	pageCount: number;
	total: number;
}
