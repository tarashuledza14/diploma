import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import 'dotenv/config';
import {
	OrderPriority,
	OrderStatus,
	PartCondition,
	PriceCategory,
	Prisma,
	PrismaClient,
	Role,
	VehicleStatus,
} from './generated/prisma/client';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
	console.log('🗑️  Clearing database...');
	// Видаляємо в порядку зворотному до залежностей
	await prisma.orderPart.deleteMany({});
	await prisma.orderService.deleteMany({});
	await prisma.order.deleteMany({});
	await prisma.vehicle.deleteMany({});
	await prisma.service.deleteMany({});
	await prisma.part.deleteMany({});
	await prisma.partCategory.deleteMany({});
	await prisma.serviceCategory.deleteMany({});
	await prisma.partsBrand.deleteMany({});
	await prisma.partsSupplier.deleteMany({});
	await prisma.partsManufacturer.deleteMany({});
	await prisma.document.deleteMany({});
	await prisma.client.deleteMany({});
	await prisma.user.deleteMany({});
}

async function main() {
	await clearDatabase();
	console.log('🚀 Starting seed...');

	// --- 1. СТВОРЕННЯ ДОВІДНИКІВ (Категорії, Бренди, Виробники) ---

	// 1.1 Категорії запчастин
	const catFluids = await prisma.partCategory.create({
		data: { name: 'Fluids' },
	});
	const catFilters = await prisma.partCategory.create({
		data: { name: 'Filters' },
	});
	const catBrakes = await prisma.partCategory.create({
		data: { name: 'Brakes' },
	});
	const catElectrical = await prisma.partCategory.create({
		data: { name: 'Electrical' },
	});
	const catSuspension = await prisma.partCategory.create({
		data: { name: 'Suspension' },
	});
	const catEngine = await prisma.partCategory.create({
		data: { name: 'Engine' },
	});
	const catLighting = await prisma.partCategory.create({
		data: { name: 'Lighting' },
	});

	// 1.2 Категорії послуг
	const srvCatDiag = await prisma.serviceCategory.create({
		data: { name: 'Діагностика' },
	});
	const srvCatRepair = await prisma.serviceCategory.create({
		data: { name: 'Ремонт' },
	});
	const srvCatReplace = await prisma.serviceCategory.create({
		data: { name: 'Заміна' },
	});
	const srvCatMaint = await prisma.serviceCategory.create({
		data: { name: 'Обслуговування' },
	});

	// 1.3 Виробники (Manufacturers) & Бренди (Brands) & Постачальники (Suppliers)
	// Створимо допоміжну мапу для швидкого доступу
	const entitiesList = [
		'Bosch',
		'Mann',
		'Brembo',
		'NGK',
		'Castrol',
		'Mahle',
		'ATE',
		'Sachs',
		'Contitech',
		'Osram',
		'Pierburg',
		'Lemförder',
		'Wahler',
		'Hella',
	];

	const manufacturersMap: Record<string, string> = {};
	const brandsMap: Record<string, string> = {};
	const suppliersMap: Record<string, string> = {};

	for (const name of entitiesList) {
		const m = await prisma.partsManufacturer.create({ data: { name } });
		manufacturersMap[name] = m.id;

		const b = await prisma.partsBrand.create({ data: { name } });
		brandsMap[name] = b.id;

		const s = await prisma.partsSupplier.create({
			data: { name: `${name} Ukraine`, contact: '+380440000000' },
		});
		suppliersMap[name] = s.id;
	}

	console.log('✅ Dictionaries created');

	// --- 2. КОРИСТУВАЧІ (Staff) ---
	const password = await argon2.hash('password123');

	const admin = await prisma.user.create({
		data: {
			email: 'admin@sto.com',
			password,
			role: Role.ADMIN,
			fullName: 'Адмін Головний',
		},
	});

	const manager1 = await prisma.user.create({
		data: {
			email: 'manager1@sto.com',
			password,
			role: Role.MANAGER,
			fullName: 'Олег Менеджер',
		},
	});

	const manager2 = await prisma.user.create({
		data: {
			email: 'manager2@sto.com',
			password,
			role: Role.MANAGER,
			fullName: 'Ірина Керуюча',
		},
	});

	// Створюємо масив механіків
	const mechanicData = [
		'Іван Гайка',
		'Петро Поршень',
		'Василь Кардан',
		'Олекса Дизель',
		'Максим Іскра',
		'Віталій Відновлювач',
		'Богдан Болтовик',
		'Ігор Інженер',
		'Павло Профі',
		'Юрій Універсал',
		'Микола Майстер',
	];

	const mechanics = [];
	for (const [index, name] of mechanicData.entries()) {
		const mech = await prisma.user.create({
			data: {
				email: `mechanic${index + 1}@sto.com`,
				password,
				role: Role.MECHANIC,
				fullName: name,
			},
		});
		mechanics.push(mech);
	}

	console.log(
		`✅ Users created: 1 Admin, 2 Managers, ${mechanics.length} Mechanics`,
	);

	// --- 3. КЛІЄНТИ (Clients) ---
	const clientsData = [
		{
			name: 'Тарас Шевченко',
			phone: '+380671234567',
			email: 'taras@gmail.com',
			notes: 'Любить каву',
		},
		{
			name: 'Марія Коваленко',
			phone: '+380502345678',
			email: 'maria@gmail.com',
		},
		{
			name: 'Олександр Петренко',
			phone: '+380933456789',
			email: 'alex@ukr.net',
		},
		{ name: 'Наталія Бондаренко', phone: '+380634567890', email: null },
		{
			name: 'Дмитро Сидоренко',
			phone: '+380955678901',
			email: 'dmytro@gmail.com',
		},
		{ name: 'Анна Мельник', phone: '+380971234568', email: 'anna@gmail.com' },
		{ name: 'Сергій Іваненко', phone: '+380682345679', email: null },
		{ name: 'Оксана Ткаченко', phone: '+380503456780', email: null },
		{
			name: 'Володимир Григоренко',
			phone: '+380934567891',
			email: 'volodymyr@gmail.com',
		},
		{ name: 'Юлія Романова', phone: '+380635678902', email: 'julia@ukr.net' },
		{ name: 'Андрій Козак', phone: '+380956789013', email: null },
		{
			name: 'Ірина Семенова',
			phone: '+380971234569',
			email: 'iryna@gmail.com',
			notes: 'VIP',
		},
		{
			name: 'Богдан Ковальчук',
			phone: '+380682345680',
			email: 'bogdan@ukr.net',
		},
		{ name: 'Тетяна Литвиненко', phone: '+380503456781', email: null },
		{
			name: 'Віктор Павленко',
			phone: '+380934567892',
			email: 'viktor@gmail.com',
		},
	];

	const clients = [];
	for (const c of clientsData) {
		const client = await prisma.client.create({
			data: {
				fullName: c.name,
				phone: c.phone,
				email: c.email,
				notes: c.notes,
			},
		});
		clients.push(client);
	}

	console.log(`✅ Clients created: ${clients.length}`);

	// --- 4. АВТОМОБІЛІ (Vehicles) ---
	const vehiclesData = [
		{
			vin: '1HGBH41JXMN109186',
			brand: 'Volkswagen',
			model: 'Golf',
			year: 2015,
			plate: 'АА1234ВВ',
			owner: 0,
			status: VehicleStatus.OUT,
		},
		{
			vin: '2HGBH41JXMN109187',
			brand: 'BMW',
			model: 'X5',
			year: 2018,
			plate: 'ВВ5678КК',
			owner: 1,
			status: VehicleStatus.PENDING,
		},
		{
			vin: '3HGBH41JXMN109188',
			brand: 'Toyota',
			model: 'Camry',
			year: 2020,
			plate: 'СС9012ММ',
			owner: 2,
			status: VehicleStatus.IN_SERVICE,
		},
		{
			vin: '4HGBH41JXMN109189',
			brand: 'Mercedes-Benz',
			model: 'E-Class',
			year: 2019,
			plate: 'ММ3456АА',
			owner: 2,
			status: VehicleStatus.OUT,
		},
		{
			vin: '5HGBH41JXMN109190',
			brand: 'Honda',
			model: 'Accord',
			year: 2017,
			plate: 'КК7890ВВ',
			owner: 3,
			status: VehicleStatus.READY,
		},
		{
			vin: '6HGBH41JXMN109191',
			brand: 'Audi',
			model: 'A4',
			year: 2016,
			plate: 'АА4567СС',
			owner: 4,
			status: VehicleStatus.OUT,
		},
		{
			vin: '7HGBH41JXMN109192',
			brand: 'Nissan',
			model: 'Qashqai',
			year: 2019,
			plate: 'ВВ8901ДД',
			owner: 5,
			status: VehicleStatus.OUT,
		},
		{
			vin: '8HGBH41JXMN109193',
			brand: 'Mazda',
			model: 'CX-5',
			year: 2021,
			plate: 'СС2345ЕЕ',
			owner: 6,
			status: VehicleStatus.PENDING,
		},
		{
			vin: '9HGBH41JXMN109194',
			brand: 'Hyundai',
			model: 'Tucson',
			year: 2018,
			plate: 'ММ6789ЖЖ',
			owner: 7,
			status: VehicleStatus.OUT,
		},
		{
			vin: 'AHGBH41JXMN109195',
			brand: 'Kia',
			model: 'Sportage',
			year: 2020,
			plate: 'КК1234ЗЗ',
			owner: 8,
			status: VehicleStatus.IN_SERVICE,
		},
		{
			vin: 'BHGBH41JXMN109196',
			brand: 'Škoda',
			model: 'Octavia',
			year: 2017,
			plate: 'АА5678ІІ',
			owner: 9,
			status: VehicleStatus.OUT,
		},
		{
			vin: 'CHGBH41JXMN109197',
			brand: 'Renault',
			model: 'Duster',
			year: 2019,
			plate: 'ВВ9012ЙЙ',
			owner: 10,
			status: VehicleStatus.READY,
		},
		{
			vin: 'DHGBH41JXMN109198',
			brand: 'Ford',
			model: 'Focus',
			year: 2016,
			plate: 'СС3456КК',
			owner: 11,
			status: VehicleStatus.OUT,
		},
		{
			vin: 'EHGBH41JXMN109199',
			brand: 'Peugeot',
			model: '308',
			year: 2018,
			plate: 'ММ7890ЛЛ',
			owner: 12,
			status: VehicleStatus.PENDING,
		},
		{
			vin: 'FHGBH41JXMN109200',
			brand: 'Opel',
			model: 'Astra',
			year: 2017,
			plate: 'КК4567ММ',
			owner: 13,
			status: VehicleStatus.OUT,
		},
	];

	const vehicles = [];
	for (const v of vehiclesData) {
		const vehicle = await prisma.vehicle.create({
			data: {
				vin: v.vin,
				brand: v.brand,
				model: v.model,
				year: v.year,
				plateNumber: v.plate,
				mileage: Math.floor(Math.random() * 150000) + 20000,
				ownerId: clients[v.owner].id,
				status: v.status,
			},
		});
		vehicles.push(vehicle);
	}
	console.log(`✅ Vehicles created: ${vehicles.length}`);

	// --- 5. ЗАПЧАСТИНИ (Parts) ---
	const parts = await Promise.all([
		await prisma.part.create({
			data: {
				// Основна інформація
				code: 'PRT-001',
				name: 'Фільтр масляний Bosch',
				sku: 'BOSCH-0451103336',
				oem: '06A115561B',
				barcode: '4047024452361',

				// Зв'язки
				categoryId: catFilters.id,
				brandId: brandsMap['Bosch'],
				manufacturerId: manufacturersMap['Bosch'],
				supplierId: suppliersMap['Bosch'],

				// Склад та одиниці
				location: 'Сектор А, Полиця 1, Місце 12',
				unit: 'шт',
				minStock: 5,
				quantityAvailable: 25,
				quantityReserved: 2,
				quantityTotal: 27,

				// Ціноутворення
				purchasePrice: new Prisma.Decimal(120.5),
				retailPrice: new Prisma.Decimal(180.0),
				markup: 50,
				priceCategory: 'RETAIL',

				// Характеристики
				condition: 'NEW',
				compatibility: ['VW Golf IV', 'Audi A3 8L', 'Skoda Octavia Tour'],
				crossNumbers: ['MANN W719/30', 'KNECHT OC264', 'FILTRON OP526/1'],
				weight: '0.340 кг',
				dimensions: '76x76x123 мм',

				// Додатково
				supplierContact: '+380671234567 (Олексій)',
				warrantyMonths: 12,
				warrantyKm: 15000,
				photo: 'https://cdn.parts.com/photos/bosch-0451103336.jpg',
				notes: 'Преміальна лінійка, рекомендовано для синтетичних мастил.',

				// Дати та історія
				lastRestocked: new Date(),
				createdAt: new Date(),
				movementHistory: [
					{ date: '2026-02-15', action: 'прихід', qty: 30, user: 'Admin' },
					{ date: '2026-02-16', action: 'продаж', qty: 3, user: 'Manager' },
				],
			},
		}),

		await prisma.part.create({
			data: {
				// Основна інформація
				code: 'PRT-002',
				name: 'Фільтр повітряний Mann-Filter',
				sku: 'MANN-C27011',
				oem: '5Q0129620B',
				barcode: '4011558720112',

				// Зв'язки
				categoryId: catFilters.id,
				brandId: brandsMap['Mann'],
				manufacturerId: manufacturersMap['Mann'],
				supplierId: suppliersMap['Mann'],

				// Склад та одиниці
				location: 'Сектор А, Полиця 2, Місце 05',
				unit: 'шт',
				minStock: 3,
				quantityAvailable: 15,
				quantityReserved: 0,
				quantityTotal: 15,

				// Ціноутворення
				purchasePrice: new Prisma.Decimal(210.0),
				retailPrice: new Prisma.Decimal(320.0),
				markup: 52,
				priceCategory: 'RETAIL',

				// Характеристики
				condition: 'NEW',
				compatibility: ['VW Passat B8', 'Audi A4 B9', 'Skoda Superb III'],
				crossNumbers: ['BOSCH F026400287', 'KNECHT LX3502', 'HENGST E1090L'],
				weight: '0.420 кг',
				dimensions: '267x180x45 мм',

				// Додатково
				supplierContact: 'sales@mann-filter.ua',
				warrantyMonths: 6,
				warrantyKm: 10000,
				photo: 'https://cdn.parts.com/photos/mann-c27011.jpg',
				notes: 'Збільшений ресурс для запилених доріг.',

				// Дати та історія
				lastRestocked: new Date(),
				createdAt: new Date(),
				movementHistory: [
					{ date: '2026-02-17', action: 'прихід', qty: 15, user: 'Admin' },
				],
			},
		}),
		prisma.part.create({
			data: {
				name: 'Колодки гальмівні передні',
				sku: 'BREMBO-P85020',
				code: 'PRT-003',
				categoryId: catBrakes.id,
				manufacturerId: manufacturersMap['Brembo'],
				brandId: brandsMap['Brembo'],
				supplierId: suppliersMap['Brembo'],
				location: 'Полиця B-3',
				quantityAvailable: 10,
				purchasePrice: 1200,
				retailPrice: 1800,
				priceCategory: PriceCategory.SPECIAL,
				condition: PartCondition.NEW,
				compatibility: ['VW Golf', 'Audi A3'],
			},
		}),
		prisma.part.create({
			data: {
				name: 'Свічки запалювання',
				sku: 'NGK-BKR6E',
				code: 'PRT-004',
				categoryId: catElectrical.id,
				manufacturerId: manufacturersMap['NGK'],
				brandId: brandsMap['NGK'],
				supplierId: suppliersMap['NGK'],
				location: 'Полиця C-1',
				quantityAvailable: 40,
				purchasePrice: 80,
				retailPrice: 150,
				priceCategory: PriceCategory.WHOLESALE,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Мастило моторне 5W-40',
				sku: 'CASTROL-5W40-5L',
				code: 'PRT-005',
				categoryId: catFluids.id,
				manufacturerId: manufacturersMap['Castrol'],
				brandId: brandsMap['Castrol'],
				supplierId: suppliersMap['Castrol'],
				location: 'Склад D-1',
				quantityAvailable: 30,
				purchasePrice: 850,
				retailPrice: 1200,
				priceCategory: PriceCategory.SPECIAL,
				condition: PartCondition.NEW,
				unit: 'каністра',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Фільтр салону',
				sku: 'MAHLE-LX2046',
				code: 'PRT-006',
				categoryId: catFilters.id,
				manufacturerId: manufacturersMap['Mahle'],
				brandId: brandsMap['Mahle'],
				supplierId: suppliersMap['Mahle'],
				quantityAvailable: 20,
				purchasePrice: 180,
				retailPrice: 270,
				priceCategory: PriceCategory.RETAIL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Гальмівний диск задній',
				sku: 'ATE-24032501512',
				code: 'PRT-007',
				categoryId: catBrakes.id,
				manufacturerId: manufacturersMap['ATE'],
				brandId: brandsMap['ATE'],
				supplierId: suppliersMap['ATE'],
				quantityAvailable: 8,
				purchasePrice: 1700,
				retailPrice: 2500,
				priceCategory: PriceCategory.WHOLESALE,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Амортизатор задній',
				sku: 'SACHS-313556',
				code: 'PRT-008',
				categoryId: catSuspension.id,
				manufacturerId: manufacturersMap['Sachs'],
				brandId: brandsMap['Sachs'],
				supplierId: suppliersMap['Sachs'],
				quantityAvailable: 9,
				purchasePrice: 1400,
				retailPrice: 2100,
				priceCategory: PriceCategory.WHOLESALE,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Ремінь генератора',
				sku: 'CONTITECH-6PK1873',
				code: 'PRT-009',
				categoryId: catEngine.id,
				manufacturerId: manufacturersMap['Contitech'],
				brandId: brandsMap['Contitech'],
				supplierId: suppliersMap['Contitech'],
				quantityAvailable: 12,
				purchasePrice: 350,
				retailPrice: 500,
				priceCategory: PriceCategory.SPECIAL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Лампа стоп-сигналу',
				sku: 'OSRAM-7506',
				code: 'PRT-010',
				categoryId: catLighting.id,
				manufacturerId: manufacturersMap['Osram'],
				brandId: brandsMap['Osram'],
				supplierId: suppliersMap['Osram'],
				quantityAvailable: 30,
				purchasePrice: 60,
				retailPrice: 100,
				priceCategory: PriceCategory.RETAIL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Паливний насос',
				sku: 'PIERBURG-7.21659.70.0',
				code: 'PRT-011',
				categoryId: catFluids.id, // Або Engine
				manufacturerId: manufacturersMap['Pierburg'],
				brandId: brandsMap['Pierburg'],
				supplierId: suppliersMap['Pierburg'],
				quantityAvailable: 6,
				purchasePrice: 2500,
				retailPrice: 3400,
				priceCategory: PriceCategory.WHOLESALE,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Стійка стабілізатора задня',
				sku: 'LEMFORDER-37417',
				code: 'PRT-012',
				categoryId: catSuspension.id,
				manufacturerId: manufacturersMap['Lemförder'],
				brandId: brandsMap['Lemförder'],
				supplierId: suppliersMap['Lemförder'],
				quantityAvailable: 14,
				purchasePrice: 220,
				retailPrice: 350,
				priceCategory: PriceCategory.RETAIL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Термостат корпусний',
				sku: 'WAHLER-410480D',
				code: 'PRT-013',
				categoryId: catEngine.id,
				manufacturerId: manufacturersMap['Wahler'],
				brandId: brandsMap['Wahler'],
				supplierId: suppliersMap['Wahler'],
				quantityAvailable: 11,
				purchasePrice: 400,
				retailPrice: 600,
				priceCategory: PriceCategory.RETAIL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Свічка накалу',
				sku: 'BOSCH-0250202139',
				code: 'PRT-014',
				categoryId: catElectrical.id,
				manufacturerId: manufacturersMap['Bosch'],
				brandId: brandsMap['Bosch'],
				supplierId: suppliersMap['Bosch'],
				quantityAvailable: 18,
				purchasePrice: 120,
				retailPrice: 180,
				priceCategory: PriceCategory.RETAIL,
				condition: PartCondition.NEW,
			},
		}),
		prisma.part.create({
			data: {
				name: 'Датчик температури',
				sku: 'HELLA-6PT009309-321',
				code: 'PRT-015',
				categoryId: catElectrical.id,
				manufacturerId: manufacturersMap['Hella'],
				brandId: brandsMap['Hella'],
				supplierId: suppliersMap['Hella'],
				quantityAvailable: 13,
				purchasePrice: 220,
				retailPrice: 320,
				priceCategory: PriceCategory.WHOLESALE,
				condition: PartCondition.NEW,
			},
		}),
	]);

	console.log(`✅ Parts created: ${parts.length}`);

	// --- 6. ПОСЛУГИ (Services) ---
	const services = await Promise.all([
		prisma.service.create({
			data: {
				name: 'Заміна мастила та фільтрів',
				description: 'Комплекс',
				price: 400,
				estimatedTime: 1.0,
				categoryId: srvCatMaint.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна гальмівних колодок',
				description: 'Вісь',
				price: 500,
				estimatedTime: 2.0,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: "Комп'ютерна діагностика",
				description: 'OBDII',
				price: 300,
				estimatedTime: 0.5,
				categoryId: srvCatDiag.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Розвал-сходження',
				description: '3D стенд',
				price: 600,
				estimatedTime: 1.5,
				categoryId: srvCatMaint.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт двигуна',
				description: 'Капітальний',
				price: 800,
				estimatedTime: 8.0,
				categoryId: srvCatRepair.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна ременя ГРМ',
				description: 'З помпою',
				price: 700,
				estimatedTime: 3.0,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна амортизаторів',
				description: 'Вісь',
				price: 600,
				estimatedTime: 2.5,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт ходової',
				description: 'Дефектовка та ремонт',
				price: 650,
				estimatedTime: 4.0,
				categoryId: srvCatRepair.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна зчеплення',
				description: 'Комплект',
				price: 850,
				estimatedTime: 5.0,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт кондиціонера',
				description: 'Заправка та ремонт',
				price: 550,
				estimatedTime: 2.0,
				categoryId: srvCatRepair.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна свічок',
				description: 'Заміна свічок запалювання',
				price: 350,
				estimatedTime: 0.75,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Балансування коліс',
				description: 'Шиномонтаж',
				price: 400,
				estimatedTime: 1.0,
				categoryId: srvCatMaint.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна акумулятора',
				description: 'З пропискою',
				price: 200,
				estimatedTime: 0.5,
				categoryId: srvCatReplace.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Чистка інжектора',
				description: 'Стенд',
				price: 750,
				estimatedTime: 3.0,
				categoryId: srvCatMaint.id,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт електрики',
				description: 'Пошук несправностей',
				price: 600,
				estimatedTime: 2.0,
				categoryId: srvCatRepair.id,
			},
		}),
	]);

	console.log(`✅ Services created: ${services.length}`);

	// --- 7. ЗАМОВЛЕННЯ (Orders) ---

	// Допоміжна функція для створення замовлення
	const createOrder = async (
		idx: number,
		status: OrderStatus,
		vehicleIdx: number,
		clientIdx: number,
		manager: any,
		mechanic: any,
		desc: string,
		items: {
			type: 'part' | 'service';
			idx: number;
			qty: number;
			price: number;
		}[],
		priority: OrderPriority = OrderPriority.MEDIUM,
		date = new Date(),
	) => {
		// Рахуємо суму
		const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

		const order = await prisma.order.create({
			data: {
				status,
				description: desc,
				totalAmount: total,
				priority,
				vehicleId: vehicles[vehicleIdx].id,
				clientId: clients[clientIdx].id,
				managerId: manager.id,
				mechanicId: mechanic ? mechanic.id : null,
				startDate: date,
				endDate:
					status === OrderStatus.COMPLETED || status === OrderStatus.PAID
						? date
						: null,
			},
		});

		for (const item of items) {
			if (item.type === 'part') {
				await prisma.orderPart.create({
					data: {
						orderId: order.id,
						partId: parts[item.idx].id,
						quantity: item.qty,
						price: item.price,
					},
				});
			} else {
				await prisma.orderService.create({
					data: {
						orderId: order.id,
						serviceId: services[item.idx].id,
						quantity: item.qty,
						price: item.price,
					},
				});
			}
		}
		return order;
	};

	const orders = [];

	// Створюємо 15 замовлень на основі логіки з попереднього файлу, але через функцію
	orders.push(
		await createOrder(
			0,
			OrderStatus.COMPLETED,
			0,
			0,
			manager1,
			mechanics[0],
			'Планова заміна мастила',
			[
				{ type: 'part', idx: 0, qty: 1, price: 180 },
				{ type: 'part', idx: 4, qty: 1, price: 1200 },
				{ type: 'service', idx: 0, qty: 1.5, price: 400 },
			],
			OrderPriority.MEDIUM,
			new Date('2026-01-15'),
		),
	);

	orders.push(
		await createOrder(
			1,
			OrderStatus.IN_PROGRESS,
			2,
			2,
			manager1,
			mechanics[1],
			'Гальма',
			[
				{ type: 'part', idx: 2, qty: 1, price: 1800 },
				{ type: 'service', idx: 2, qty: 1, price: 300 },
				{ type: 'service', idx: 1, qty: 1, price: 500 },
			],
			OrderPriority.HIGH,
			new Date('2026-01-28'),
		),
	);

	orders.push(
		await createOrder(
			2,
			OrderStatus.NEW,
			1,
			1,
			manager2,
			null,
			'Діагностика двигуна',
			[{ type: 'service', idx: 2, qty: 1, price: 300 }],
			OrderPriority.HIGH,
			new Date('2026-01-30'),
		),
	);

	// ... Додаємо ще замовлення аналогічно, використовуючи індекси масивів vehicles, clients, parts, services

	// Приклад ще одного замовлення (Order 5 з вашого файлу)
	orders.push(
		await createOrder(
			4,
			OrderStatus.COMPLETED,
			5,
			4,
			manager2,
			mechanics[1],
			'Заміна свічок',
			[
				{ type: 'part', idx: 3, qty: 4, price: 150 },
				{ type: 'service', idx: 10, qty: 0.5, price: 263 },
			],
			OrderPriority.MEDIUM,
			new Date('2026-01-25'),
		),
	);

	console.log(`✅ Orders created (Sample)`);

	// --- 8. ОНОВЛЕННЯ ДЕНОРМАЛІЗОВАНИХ ПОЛІВ ---

	console.log('🔄 Syncing denormalized data...');

	for (const client of clients) {
		const stats = await prisma.order.aggregate({
			where: { clientId: client.id },
			_count: true,
			_sum: { totalAmount: true },
		});
		const vehicleCount = await prisma.vehicle.count({
			where: { ownerId: client.id },
		});

		await prisma.client.update({
			where: { id: client.id },
			data: {
				totalOrders: stats._count,
				totalSpent: stats._sum.totalAmount || 0,
				vehicleCount,
			},
		});
	}

	for (const vehicle of vehicles) {
		const totalServices = await prisma.order.count({
			where: { vehicleId: vehicle.id, status: OrderStatus.COMPLETED },
		});
		await prisma.vehicle.update({
			where: { id: vehicle.id },
			data: { totalServices },
		});
	}

	console.log('🎉 Seed completed successfully!');
}

main()
	.catch(e => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
