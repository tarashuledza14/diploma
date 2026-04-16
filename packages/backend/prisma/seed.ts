import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import 'dotenv/config';
import {
	ClientType,
	MovementType,
	OrderPriority,
	OrderStatus,
	PartCondition,
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
	await prisma.stockMovement.deleteMany({});
	await prisma.orderPart.deleteMany({});
	await prisma.orderService.deleteMany({});
	await prisma.order.deleteMany({});
	await prisma.vehicle.deleteMany({});
	await prisma.service.deleteMany({});

	await prisma.partInventory.deleteMany({});
	await prisma.partPriceRule.deleteMany({});

	await prisma.part.deleteMany({});
	await prisma.partCategory.deleteMany({});
	await prisma.serviceCategory.deleteMany({});
	await prisma.partsBrand.deleteMany({});
	await prisma.partsSupplier.deleteMany({});
	await prisma.partsManufacturer.deleteMany({});
	await prisma.document.deleteMany({});
	await prisma.appSettings.deleteMany({});
	await prisma.client.deleteMany({});
	await prisma.user.deleteMany({});
	await prisma.organization.deleteMany({});

	// Після deleteMany sequence не скидаються автоматично.
	// Скидаємо order_number, щоб seed був детермінованим.
	await prisma.$executeRawUnsafe(
		'ALTER SEQUENCE "orders_order_number_seq" RESTART WITH 1;',
	);
}

async function main() {
	await clearDatabase();
	console.log('🚀 Starting seed...');
	const testPassword = 'password123';

	// --- 1. СТВОРЕННЯ ДОВІДНИКІВ (Категорії, Бренди, Виробники) ---

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

	const organization = await prisma.organization.create({
		data: {
			name: 'Default Organization',
		},
	});
	const organizationId = organization.id;

	// --- 2. КОРИСТУВАЧІ (Staff) ---
	const password = await argon2.hash(testPassword);
	const staffSeedUsers = [
		{
			email: 'admin@sto.com',
			fullName: 'Адмін Головний',
			role: Role.ADMIN,
		},
		{
			email: 'manager@sto.com',
			fullName: 'Олег Менеджер',
			role: Role.MANAGER,
		},
		{
			email: 'mechanic1@sto.com',
			fullName: 'Іван Гайка',
			role: Role.MECHANIC,
		},
		{
			email: 'mechanic2@sto.com',
			fullName: 'Петро Поршень',
			role: Role.MECHANIC,
		},
	] as const;

	const createdStaffUsers = await Promise.all(
		staffSeedUsers.map(user =>
			prisma.user.create({
				data: {
					...user,
					password,
					organizationId,
				},
			}),
		),
	);

	const admin = createdStaffUsers.find(user => user.role === Role.ADMIN)!;
	const manager1 = createdStaffUsers.find(user => user.role === Role.MANAGER)!;
	const mechanics = createdStaffUsers.filter(
		user => user.role === Role.MECHANIC,
	);

	console.log('✅ Users created');
	console.log('🔐 Test users credentials:');
	for (const user of createdStaffUsers) {
		console.log(`   ${user.role}: ${user.email} / ${testPassword}`);
	}

	// --- 3. КЛІЄНТИ (Clients) ---
	const clients = [
		await prisma.client.create({
			data: {
				fullName: 'Тарас Шевченко',
				phone: '+380671234567',
				email: 'taras@gmail.com',
				notes: 'VIP',
				organizationId,
			},
		}),
		await prisma.client.create({
			data: {
				fullName: 'Марія Коваленко',
				phone: '+380502345678',
				organizationId,
			},
		}),
		await prisma.client.create({
			data: {
				fullName: 'Олександр Петренко',
				phone: '+380933456789',
				organizationId,
			},
		}),
	];

	console.log('✅ Clients created');

	// --- 4. АВТОМОБІЛІ (Vehicles) ---
	const vehicles = [
		await prisma.vehicle.create({
			data: {
				vin: '1HGBH41JXMN109186',
				brand: 'VW',
				model: 'Golf',
				year: 2015,
				plateNumber: 'АА1234ВВ',
				mileage: 120000,
				ownerId: clients[0].id,
				organizationId,
				status: VehicleStatus.OUT,
			},
		}),
		await prisma.vehicle.create({
			data: {
				vin: '2HGBH41JXMN109187',
				brand: 'BMW',
				model: 'X5',
				year: 2018,
				plateNumber: 'ВВ5678КК',
				mileage: 85000,
				ownerId: clients[1].id,
				organizationId,
				status: VehicleStatus.PENDING,
			},
		}),
	];

	console.log('✅ Vehicles created');

	// --- 5. ЗАПЧАСТИНИ (Parts) ---
	const parts: Array<{ id: string }> = [];

	parts.push(
		await prisma.part.create({
			data: {
				code: 'PRT-001',
				name: 'Фільтр масляний Bosch',
				sku: 'BOSCH-0451103336',
				organizationId,
				oem: '06A115561B',
				barcode: '4047024452361',
				unit: 'шт',
				minStock: 5,
				weight: '0.340 кг',
				dimensions: '76x76x123 мм',
				condition: PartCondition.NEW,
				compatibility: ['VW Golf IV', 'Audi A3 8L', 'Skoda Octavia Tour'],
				crossNumbers: ['MANN W719/30', 'KNECHT OC264', 'FILTRON OP526/1'],
				notes: 'Преміальна лінійка.',
				categoryId: catFilters.id,
				brandId: brandsMap['Bosch'],
				manufacturerId: manufacturersMap['Bosch'],
				supplierId: suppliersMap['Bosch'],

				inventory: {
					create: [
						{
							quantity: 15,
							purchasePrice: 120.5,
							location: 'Сектор А, Полиця 1',
							batchNumber: 'BATCH-2025-12',
							receivedAt: new Date('2025-12-10'),
						},
						{
							quantity: 10,
							purchasePrice: 125.0,
							location: 'Сектор А, Полиця 2',
							batchNumber: 'BATCH-2026-02',
							receivedAt: new Date('2026-02-15'),
						},
					],
				},
				priceRules: {
					create: [
						{
							clientType: ClientType.RETAIL,
							markupPercent: 50,
							fixedPrice: 187.5,
						},
						{
							clientType: ClientType.WHOLESALE,
							markupPercent: 25,
							fixedPrice: 156.25,
						},
					],
				},
				stockMovements: {
					create: [
						{
							type: MovementType.RECEIVED,
							quantity: 15,
							reason: 'Initial import (Batch 1)',
							userId: admin.id,
						},
						{
							type: MovementType.RECEIVED,
							quantity: 10,
							reason: 'Initial import (Batch 2)',
							userId: admin.id,
						},
					],
				},
			},
		}),
	);

	parts.push(
		await prisma.part.create({
			data: {
				code: 'PRT-002',
				name: 'Колодки гальмівні передні Brembo',
				sku: 'BREMBO-P85020',
				organizationId,
				unit: 'комплект',
				minStock: 2,
				categoryId: catBrakes.id,
				brandId: brandsMap['Brembo'],
				inventory: {
					create: [
						{ quantity: 4, purchasePrice: 1200.0, location: 'Полиця B-3' },
						{ quantity: 5, purchasePrice: 1220.0, location: 'Полиця B-4' },
					],
				},
				priceRules: {
					create: [{ clientType: ClientType.RETAIL, fixedPrice: 1800.0 }],
				},
				stockMovements: {
					create: [
						{
							type: MovementType.RECEIVED,
							quantity: 4,
							reason: 'Initial import',
							userId: admin.id,
						},
						{
							type: MovementType.RECEIVED,
							quantity: 5,
							reason: 'Initial import',
							userId: admin.id,
						},
					],
				},
			},
		}),
	);

	parts.push(
		await prisma.part.create({
			data: {
				code: 'PRT-003',
				name: 'Мастило моторне Castrol EDGE 5W-40',
				sku: 'CASTROL-5W40-5L',
				organizationId,
				unit: 'каністра (5л)',
				minStock: 10,
				categoryId: catFluids.id,
				brandId: brandsMap['Castrol'],
				inventory: {
					create: [
						{ quantity: 30, purchasePrice: 850.0, location: 'Склад ПММ' },
					],
				},
				priceRules: {
					create: [
						{
							clientType: ClientType.RETAIL,
							markupPercent: 40,
							fixedPrice: 1190.0,
						},
					],
				},
				stockMovements: {
					create: [
						{
							type: MovementType.RECEIVED,
							quantity: 30,
							reason: 'Initial import',
							userId: admin.id,
						},
					],
				},
			},
		}),
	);

	parts.push(
		await prisma.part.create({
			data: {
				code: 'PRT-004',
				name: 'Свічки запалювання NGK',
				sku: 'NGK-BKR6E',
				organizationId,
				categoryId: catElectrical.id,
				brandId: brandsMap['NGK'],
				inventory: {
					create: [{ quantity: 40, purchasePrice: 80.0, location: 'Сектор Е' }],
				},
				priceRules: {
					create: [{ clientType: ClientType.RETAIL, fixedPrice: 150.0 }],
				},
				stockMovements: {
					create: [
						{
							type: MovementType.RECEIVED,
							quantity: 40,
							reason: 'Initial import',
							userId: admin.id,
						},
					],
				},
			},
		}),
	);

	console.log(`✅ Parts created: ${parts.length}`);

	// --- 6. ПОСЛУГИ (Services) ---
	const services = [
		await prisma.service.create({
			data: {
				name: 'Заміна мастила',
				description: 'Комплекс',
				organizationId,
				price: 400,
				estimatedTime: 1.0,
				categoryId: srvCatMaint.id,
				// ЗМІНЕНО: Прив'язуємо категорії необхідних матеріалів (Filters та Fluids)
				requiredCategories: {
					connect: [{ id: catFilters.id }, { id: catFluids.id }],
				},
			},
		}),
		await prisma.service.create({
			data: {
				name: 'Заміна колодок',
				description: 'Вісь',
				organizationId,
				price: 500,
				estimatedTime: 2.0,
				categoryId: srvCatReplace.id,
				// ЗМІНЕНО: Прив'язуємо категорію (Brakes)
				requiredCategories: {
					connect: [{ id: catBrakes.id }],
				},
			},
		}),
	];

	console.log(`✅ Services created`);
	const createOrder = async (
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
	) => {
		const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

		const order = await prisma.order.create({
			data: {
				status,
				description: desc,
				totalAmount: total,
				priority: OrderPriority.MEDIUM,
				vehicleId: vehicles[vehicleIdx].id,
				clientId: clients[clientIdx].id,
				managerId: manager.id,
				mechanicId: mechanic ? mechanic.id : null,
				// ДОДАНО: Обов'язкове поле пробігу. Беремо поточний пробіг автомобіля
				mileage: vehicles[vehicleIdx].mileage,
				// ДОДАНО (Опціонально): приклад знижки
				discount: 0,
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

				// Автоматичне створення логу видачі зі складу, якщо це деталь
				await prisma.stockMovement.create({
					data: {
						partId: parts[item.idx].id,
						type: MovementType.ISSUED,
						quantity: -item.qty, // Від'ємне число, бо деталь пішла зі складу
						reason: 'Issued for Repair Order',
						orderId: order.id,
						userId: mechanic ? mechanic.id : manager.id, // Хто взяв деталь
					},
				});
			} else {
				await prisma.orderService.create({
					data: {
						orderId: order.id,
						serviceId: services[item.idx].id,
						quantity: item.qty,
						price: item.price,
						// ДОДАНО: Прив'язуємо конкретного механіка до конкретної роботи
						mechanicId: mechanic ? mechanic.id : null,
					},
				});
			}
		}
		return order;
	};

	// Створюємо замовлення-приклад, у якому використано Мастило та Фільтр
	await createOrder(
		OrderStatus.COMPLETED,
		0, // VW Golf
		0, // Тарас Шевченко
		manager1,
		mechanics[0],
		'Планова заміна мастила',
		[
			{ type: 'part', idx: 0, qty: 1, price: 187.5 }, // Беремо 1 Фільтр
			{ type: 'part', idx: 2, qty: 1, price: 1190 }, // Беремо 1 Мастило
			{ type: 'service', idx: 0, qty: 1, price: 400 },
		],
	);

	await createOrder(
		OrderStatus.IN_PROGRESS,
		1, // BMW X5
		1, // Марія Коваленко
		manager1,
		mechanics[1],
		'Заміна передніх колодок',
		[
			{ type: 'part', idx: 1, qty: 1, price: 1800 },
			{ type: 'service', idx: 1, qty: 1, price: 500 },
		],
	);

	console.log(`✅ Orders and Stock Movements created (Sample)`);

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
