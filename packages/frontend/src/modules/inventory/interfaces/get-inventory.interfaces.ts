import { PaginationFilterSortOptions } from '@/shared';
import { InventoryPart } from './inventory.interfaces';

export interface GetInventoryParams extends PaginationFilterSortOptions<InventoryPart> {}
