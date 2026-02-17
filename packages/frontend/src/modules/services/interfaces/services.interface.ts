export interface Service {
	categoryId: number;
	price: number; // Ціна нормо-години
	estimatedTime: number; // Орієнтовний час (годин)
	status: boolean;
	name: string; // Назва роботи (Заміна мастила)
	description: string; // Опис роботи (для клієнта)
	// parts: ServicePart[]; // Запчастини, які використовуються для цієї послуги
}
