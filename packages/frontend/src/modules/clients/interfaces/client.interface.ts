export interface Client {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	avatar: string;
	vehicleCount: number;
	totalOrders: number;
	totalSpent: number;
	status: string;
	latestVisit: string;
	notes?: string;
}
