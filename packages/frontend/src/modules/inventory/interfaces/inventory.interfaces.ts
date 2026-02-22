// 1. Enums
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

// 2. Допоміжні інтерфейси для зв'язків
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

// ДОДАНО: Інтерфейс для залишків на складі
export interface PartInventory {
	id: string;
	partId: string;
	quantity: number;
	purchasePrice: number | string; // Залежить від того, як бекенд серіалізує Decimal
	location?: string | null;
	batchNumber?: string | null;
	receivedAt: string;
}

// ДОДАНО: Інтерфейс для правил ціноутворення
export interface PartPriceRule {
	id: string;
	partId: string;
	clientType?: ClientType | null;
	markupPercent?: number | null;
	fixedPrice?: number | string | null;
	createdAt: string;
}

// 3. Основний інтерфейс (Inventory / Part)
export interface InventoryPart {
	id: string;

	// Основна інформація
	name: string;
	sku: string;
	code?: string | null;
	oem?: string | null;
	barcode?: string | null;

	// Зв'язки (Relations)
	category?: PartCategory | null;
	brand?: PartsBrand | null;
	manufacturer?: Manufacturer | null;
	supplier?: PartsSupplier | null;
	supplierContact?: string | null;

	// Характеристики
	compatibility: string[];
	crossNumbers: string[];
	unit?: string | null;
	condition?: PartCondition | null;
	minStock?: number | null;

	// Деталі товару
	warrantyMonths?: number | null;
	warrantyKm?: number | null;
	weight?: string | null;
	dimensions?: string | null;
	photo?: string | null;
	notes?: string | null;

	// Дати
	createdAt?: string | null;
	updatedAt?: string | null;

	// ДОДАНО: Зв'язки з новими таблицями
	inventory?: PartInventory[];
	priceRules?: PartPriceRule[];
}

// 4. Інтерфейси для довідників та статистики
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
	totalPurchaseSpent: number; // Оновлено відповідно до бекенду
}
