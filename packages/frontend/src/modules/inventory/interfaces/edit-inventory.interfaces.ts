export interface PartFormData {
	name: string;
	sku: string;
	oem?: string | null;
	category?: any;
	brand?: any;
	supplier?: any;
	barcode?: string | null;
	compatibility?: string[];
	condition?: string | null;
	warrantyMonths?: number | null;
	warrantyKm?: number | null;
	notes?: string | null;

	// Плоскі поля зі вкладок Stock та Finance
	purchasePrice?: number;
	retailPrice?: number;
	priceCategory?: string;
	location?: string | null;
	unit?: string | null;
	quantityAvailable?: number;
	quantityReserved?: number; // Залишили для відображення (read-only)
	minStock?: number | null;
	weight?: string | null;
	dimensions?: string | null;
}
