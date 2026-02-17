// 4. Інтерфейс для всіх довідників (Dictionaries)
export interface InventoryDictionaries {
	brands: PartsBrand[];
	categories: PartCategory[];
	manufacturers: Manufacturer[];
	suppliers: PartsSupplier[];
}
// 1. Enums (щоб відповідати Prisma enum)
export enum PriceCategory {
	RETAIL = 'RETAIL',
	WHOLESALE = 'WHOLESALE',
	SPECIAL = 'SPECIAL',
}

export enum PartCondition {
	NEW = 'NEW',
	USED = 'USED',
	REFURBISHED = 'REFURBISHED',
}

// 2. Допоміжні інтерфейси для зв'язків (Relations)
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

// 3. Основний інтерфейс (Inventory / Part)
export interface InventoryPart {
	id: string;

	// Основна інформація
	name: string;
	sku: string; // Артикул виробника (Unique)
	code?: string | null; // Внутрішній код (Unique)
	oem?: string | null; // Оригінальний номер
	barcode?: string | null;

	// Зв'язки (Relations)
	categoryId?: string | null;
	category?: PartCategory | null;

	brandId?: string | null;
	brand?: PartsBrand | null; // Тепер це об'єкт, а не рядок

	manufacturerId?: string | null;
	manufacturer?: Manufacturer | null; // Тепер це об'єкт, а не рядок

	supplierId?: string | null;
	supplier?: PartsSupplier | null; // Тепер це об'єкт, а не рядок
	supplierContact?: string | null; // Залишив, якщо ви дублюєте це поле, але краще брати з supplier.contact

	// Характеристики
	compatibility: string[]; // Масив рядків (Models)
	crossNumbers: string[]; // Масив рядків (Cross-codes)

	location?: string | null;
	unit?: string | null; // шт, л, комплект
	condition?: PartCondition | null; // Enum

	// Кількість (Stock)
	minStock?: number | null;
	quantityAvailable: number;
	quantityReserved: number;
	quantityTotal: number;

	// Ціни (Financial)
	// Prisma Decimal зазвичай приходить як string або number в залежності від конфігурації.
	// Для фронтенду часто зручніше number.
	purchasePrice?: number | null;
	retailPrice?: number | null;
	markup?: number | null; // % націнки
	priceCategory?: PriceCategory | null; // Enum

	// Деталі товару
	warrantyMonths?: number | null;
	warrantyKm?: number | null;
	weight?: string | null;
	dimensions?: string | null;
	photo?: string | null;
	notes?: string | null;

	// Дати та історія
	lastRestocked?: string | null; // ISO Date string
	createdAt?: string | null; // ISO Date string
	movementHistory?: any; // Json об'єкт або масив
}
