import { PaginationFilterSortOptions } from '@/shared';
import { Service } from './services.interface';

export interface GetServicesParams extends PaginationFilterSortOptions<Service> {}

export interface GetServicesResponse {
	data: Service[];
	total: number;
	pageCount: number;
}
