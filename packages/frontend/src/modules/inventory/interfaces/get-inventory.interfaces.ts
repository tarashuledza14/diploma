import { PaginationFilterSortOptions } from '@/shared';
import { InventoryPart } from './inventory.interfaces';

export interface GetInventoryParams extends PaginationFilterSortOptions<InventoryPart> {}
export interface StockMovement {
	id: string;
	partId: string;
	type: 'RECEIVED' | 'ISSUED' | 'RESERVED' | 'RETURNED' | 'ADJUSTMENT';
	quantity: number;
	reason?: string;
	createdAt: string;
	user?: { fullName: string } | null;
	order?: { id: string } | null;
}

export interface MovementHistoryResponse {
	stats: {
		received: number;
		issued: number;
		reserved: number;
		returned: number;
	};
	history: StockMovement[];
}
