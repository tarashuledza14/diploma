import { PartCategory } from '@/modules/inventory/interfaces/inventory.interfaces';

export interface Service {
	id: string;
	categoryId: number;
	category: Pick<PartCategory, 'id' | 'name'> | null;
	price: number;
	estimatedTime: number;
	status: boolean;
	name: string;
	description: string;
	requiredCategories: Pick<PartCategory, 'id' | 'name'>[];
}
export interface GetServicesResponse {
	data: Service[];
	total: number;
}

export interface ServiceDictionaries {
	partCategories: Pick<PartCategory, 'id' | 'name'>[];
	serviceCategories: ServiceCategory[];
}

export interface ServiceCategory {
	id: string;
	name: string;
}
