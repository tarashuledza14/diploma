export interface OrderDetailsVehicle {
	id: string;
	vin: string;
	brand: string;
	make: string;
	model: string;
	year: number;
	plateNumber?: string;
	plate?: string;
	mileage: number;
	color: string | null;
	notes?: string;
}

export interface OrderDetailsClient {
	id: string;
	fullName: string;
	name: string;
	email: string;
	phone: string;
	avatar?: string | null;
	address?: string | null;
	notes?: string | null;
}

export interface OrderDetailsAssignedTo {
	id: string;
	name: string;
	avatar?: string | null;
	specialty: string;
}

export interface OrderDetailsService {
	id: string;
	serviceId?: string;
	mechanicId?: string | null;
	name: string;
	description: string;
	price: number;
	laborHours: number;
	quantity: number;
}

export interface OrderDetailsPart {
	id: string;
	partId?: string;
	name: string;
	sku: string;
	quantity: number;
	unitPrice: number;
}

export interface OrderDetails {
	id: string;
	orderNumber: number;
	status: string;
	priority: string;
	mileage?: number;
	createdAt: string;
	dueDate: string | null;
	estimatedCompletion: string | null;
	notes: string | null;
	totalAmount: string;
	vehicle: OrderDetailsVehicle | null;
	client: OrderDetailsClient | null;
	assignedTo: OrderDetailsAssignedTo | null;
	services: OrderDetailsService[];
	parts: OrderDetailsPart[];
	media: unknown[];
}
