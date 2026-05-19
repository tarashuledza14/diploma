
export enum PartCondition {
	NEW = 'NEW',
	USED = 'USED',
	REFURBISHED = 'REFURBISHED',
}

export enum ClientType {
	RETAIL = 'RETAIL',
	WHOLESALE = 'WHOLESALE',
	VIP = 'VIP',
}


export interface PartCategory {
	id: string;
	name: string;
}

export interface PartsBrand {
	id: string;
	name: string;
}

export interface Manufacturer {
	id: string;
	name: string;
}

export interface PartsSupplier {
	id: string;
	name: string;
	contact?: string | null;
}


export interface PartInventory {
	id: string;
	partId: string;
	quantity: number;
	purchasePrice: number | string; 
	location?: string | null;
	batchNumber?: string | null;
	receivedAt: string;
}


export interface PartPriceRule {
	id: string;
	partId: string;
	clientType?: ClientType | null;
	markupPercent?: number | null;
	fixedPrice?: number | string | null;
	createdAt: string;
}


export interface InventoryPart {
	id: string;

	
	name: string;
	sku: string;
	code?: string | null;
	oem?: string | null;
	barcode?: string | null;

	
	category?: PartCategory | null;
	brand?: PartsBrand | null;
	manufacturer?: Manufacturer | null;
	supplier?: PartsSupplier | null;
	supplierContact?: string | null;

	
	compatibility: string[];
	crossNumbers: string[];
	unit?: string | null;
	condition?: PartCondition | null;
	minStock?: number | null;

	
	warrantyMonths?: number | null;
	warrantyKm?: number | null;
	weight?: string | null;
	dimensions?: string | null;
	photo?: string | null;
	notes?: string | null;

	
	createdAt?: string | null;
	updatedAt?: string | null;

	
	inventory?: PartInventory[];
	priceRules?: PartPriceRule[];
}


export interface InventoryDictionaries {
	brands: PartsBrand[];
	categories: PartCategory[];
	manufacturers: Manufacturer[];
	suppliers: PartsSupplier[];
}

export interface InventoryStats {
	totalParts: number;
	lowStock: number;
	outOfStock: number;
	retailPrice: number; 
	purchasePrice: number; 
	quantityReserved: number;
}
