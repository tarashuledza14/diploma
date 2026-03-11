export interface NewOrderClient {
	id: string;
	name: string;
	email: string;
	phone: string;
}

export interface NewOrderVehicle {
	id: string;
	clientId: string;
	make: string;
	model: string;
	year: number;
	licensePlate: string;
}

export interface NewOrderServiceMeta {
	id: string;
	name: string;
	price: number;
	duration: number;
	requiredCategories?: Array<{
		id: string;
		name: string;
	}>;
}

export interface NewOrderMechanic {
	id: string;
	name: string;
	specialty: string;
}

export interface NewOrderPart {
	id: string;
	name: string;
	price: number;
	stock: number;
	category: string;
}

export interface NewOrderMeta {
	clients: NewOrderClient[];
	vehicles: NewOrderVehicle[];
	services: NewOrderServiceMeta[];
	mechanics: NewOrderMechanic[];
	parts: NewOrderPart[];
}
