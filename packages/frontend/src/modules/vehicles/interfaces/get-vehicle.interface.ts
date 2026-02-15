import { Client } from '@/modules/clients';
import { PaginationFilterSortOptions } from '@/shared';
import { Vehicle } from './vehicle.interface';

export interface GetVehicleResponse {
	data: VehicleWithOwnerInfo[];
	total: number;
	pageCount: number;
}

export type VehicleWithOwnerInfo = Vehicle & {
	owner: Pick<Client, 'id' | 'fullName'>;
};

export interface GetVehicleParams extends PaginationFilterSortOptions<Client> {}
