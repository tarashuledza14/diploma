import { PaginationFilterSortOptions } from '@/shared';
import { OrderList, OrderListItem } from './order.interface';

export interface GetOrdersParams extends PaginationFilterSortOptions<OrderListItem> {}

export interface GetOrdersResponse {
	data: OrderList;
	pageCount: number;
	total: number;
}
