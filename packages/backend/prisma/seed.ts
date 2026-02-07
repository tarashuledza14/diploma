import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import 'dotenv/config';
import {
	OrderPriority,
	OrderStatus,
	PrismaClient,
	Role,
	VehicleStatus,
} from './generated/prisma/client';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
	// Delete in order of dependencies
	await prisma.orderPart.deleteMany({});
	await prisma.orderService.deleteMany({});
	await prisma.order.deleteMany({});
	await prisma.vehicle.deleteMany({});
	await prisma.service.deleteMany({});
	await prisma.part.deleteMany({});
	await prisma.document.deleteMany({});
	await prisma.client.deleteMany({});
	await prisma.user.deleteMany({});
}

async function main() {
	console.log('🧹 Clearing existing data...');
	await clearDatabase();
	console.log('✅ Database cleared');

	// 1. Create Users (Staff) - 15 users
	const users = await Promise.all([
		prisma.user.create({
			data: {
				email: 'admin@sto.com',
				password: await argon2.hash('admin123'),
				role: Role.ADMIN,
				fullName: 'Петро Адміністратор',
			},
		}),
		prisma.user.create({
			data: {
				email: 'manager1@sto.com',
				password: await argon2.hash('manager123'),
				role: Role.MANAGER,
				fullName: 'Ольга Менеджер',
			},
		}),
		prisma.user.create({
			data: {
				email: 'manager2@sto.com',
				password: await argon2.hash('manager123'),
				role: Role.MANAGER,
				fullName: 'Катерина Координатор',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic1@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Іван Майстер',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic2@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Василь Механік',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic3@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Андрій Автомайстер',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic4@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Сергій Сервісник',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic5@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Олег Ремонтник',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic6@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Дмитро Діагност',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic7@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Микола Налагоджувач',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic8@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Віталій Відновлювач',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic9@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Богдан Болтовик',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic10@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Ігор Інженер',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic11@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Павло Профі',
			},
		}),
		prisma.user.create({
			data: {
				email: 'mechanic12@sto.com',
				password: await argon2.hash('mechanic123'),
				role: Role.MECHANIC,
				fullName: 'Юрій Універсал',
			},
		}),
	]);

	const [admin, manager1, manager2, ...mechanics] = users;

	console.log('✅ Created 15 users');

	// 2. Create Clients - 15 clients
	const clients = await Promise.all([
		prisma.client.create({
			data: {
				fullName: 'Тарас Шевченко',
				phone: '+380671234567',
				email: 'taras@gmail.com',
				notes: 'Постійний клієнт, любить каву',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Марія Коваленко',
				phone: '+380502345678',
				email: 'maria.kovalenko@gmail.com',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Олександр Петренко',
				phone: '+380933456789',
				email: 'oleksandr.p@ukr.net',
				notes: 'Дуже вимогливий до якості',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Наталія Бондаренко',
				phone: '+380634567890',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Дмитро Сидоренко',
				phone: '+380955678901',
				email: 'dmytro.sydorenko@gmail.com',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Анна Мельник',
				phone: '+380971234568',
				email: 'anna.melnyk@gmail.com',
				notes: 'Завжди вчасно',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Сергій Іваненко',
				phone: '+380682345679',
				email: 'sergiy.ivanenko@ukr.net',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Оксана Ткаченко',
				phone: '+380503456780',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Володимир Григоренко',
				phone: '+380934567891',
				email: 'volodymyr.g@gmail.com',
				notes: 'Потребує швидкого сервісу',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Юлія Романова',
				phone: '+380635678902',
				email: 'yulia.romanova@ukr.net',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Андрій Козак',
				phone: '+380956789013',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Ірина Семенова',
				phone: '+380971234569',
				email: 'iryna.semenova@gmail.com',
				notes: 'VIP клієнт',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Богдан Ковальчук',
				phone: '+380682345680',
				email: 'bohdan.kovalchuk@ukr.net',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Тетяна Литвиненко',
				phone: '+380503456781',
			},
		}),
		prisma.client.create({
			data: {
				fullName: 'Віктор Павленко',
				phone: '+380934567892',
				email: 'viktor.pavlenko@gmail.com',
			},
		}),
	]);

	console.log('✅ Created 15 clients');

	// 3. Create Vehicles - 15 vehicles
	const vehicles = await Promise.all([
		prisma.vehicle.create({
			data: {
				vin: '1HGBH41JXMN109186',
				brand: 'Volkswagen',
				model: 'Golf',
				year: 2015,
				plateNumber: 'АА1234ВВ',
				mileage: 125000,
				color: 'Сірий',
				ownerId: clients[0].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '2HGBH41JXMN109187',
				brand: 'BMW',
				model: 'X5',
				year: 2018,
				plateNumber: 'ВВ5678КК',
				mileage: 85000,
				color: 'Чорний',
				ownerId: clients[1].id,
				status: VehicleStatus.PENDING,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '3HGBH41JXMN109188',
				brand: 'Toyota',
				model: 'Camry',
				year: 2020,
				plateNumber: 'СС9012ММ',
				mileage: 45000,
				color: 'Білий',
				ownerId: clients[2].id,
				status: VehicleStatus.IN_SERVICE,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '4HGBH41JXMN109189',
				brand: 'Mercedes-Benz',
				model: 'E-Class',
				year: 2019,
				plateNumber: 'ММ3456АА',
				mileage: 67000,
				color: 'Сріблястий',
				ownerId: clients[2].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '5HGBH41JXMN109190',
				brand: 'Honda',
				model: 'Accord',
				year: 2017,
				plateNumber: 'КК7890ВВ',
				mileage: 95000,
				color: 'Синій',
				ownerId: clients[3].id,
				status: VehicleStatus.READY,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '6HGBH41JXMN109191',
				brand: 'Audi',
				model: 'A4',
				year: 2016,
				plateNumber: 'АА4567СС',
				mileage: 110000,
				color: 'Червоний',
				ownerId: clients[4].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '7HGBH41JXMN109192',
				brand: 'Nissan',
				model: 'Qashqai',
				year: 2019,
				plateNumber: 'ВВ8901ДД',
				mileage: 72000,
				color: 'Білий',
				ownerId: clients[5].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '8HGBH41JXMN109193',
				brand: 'Mazda',
				model: 'CX-5',
				year: 2021,
				plateNumber: 'СС2345ЕЕ',
				mileage: 35000,
				color: 'Синій',
				ownerId: clients[6].id,
				status: VehicleStatus.PENDING,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: '9HGBH41JXMN109194',
				brand: 'Hyundai',
				model: 'Tucson',
				year: 2018,
				plateNumber: 'ММ6789ЖЖ',
				mileage: 98000,
				color: 'Сірий',
				ownerId: clients[7].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'AHGBH41JXMN109195',
				brand: 'Kia',
				model: 'Sportage',
				year: 2020,
				plateNumber: 'КК1234ЗЗ',
				mileage: 54000,
				color: 'Зелений',
				ownerId: clients[8].id,
				status: VehicleStatus.IN_SERVICE,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'BHGBH41JXMN109196',
				brand: 'Škoda',
				model: 'Octavia',
				year: 2017,
				plateNumber: 'АА5678ІІ',
				mileage: 115000,
				color: 'Чорний',
				ownerId: clients[9].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'CHGBH41JXMN109197',
				brand: 'Renault',
				model: 'Duster',
				year: 2019,
				plateNumber: 'ВВ9012ЙЙ',
				mileage: 88000,
				color: 'Помаранчевий',
				ownerId: clients[10].id,
				status: VehicleStatus.READY,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'DHGBH41JXMN109198',
				brand: 'Ford',
				model: 'Focus',
				year: 2016,
				plateNumber: 'СС3456КК',
				mileage: 135000,
				color: 'Синій',
				ownerId: clients[11].id,
				status: VehicleStatus.OUT,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'EHGBH41JXMN109199',
				brand: 'Peugeot',
				model: '308',
				year: 2018,
				plateNumber: 'ММ7890ЛЛ',
				mileage: 76000,
				color: 'Білий',
				ownerId: clients[12].id,
				status: VehicleStatus.PENDING,
			},
		}),
		prisma.vehicle.create({
			data: {
				vin: 'FHGBH41JXMN109200',
				brand: 'Opel',
				model: 'Astra',
				year: 2017,
				plateNumber: 'КК4567ММ',
				mileage: 102000,
				color: 'Сірий',
				ownerId: clients[13].id,
				status: VehicleStatus.OUT,
			},
		}),
	]);

	console.log('✅ Created 15 vehicles');

	// 4. Create Parts - 15 parts
	const parts = await Promise.all([
		prisma.part.create({
			data: {
				name: 'Фільтр масляний',
				sku: 'BOSCH-0451103336',
				manufacturer: 'Bosch',
				quantity: 25,
				buyPrice: 120,
				sellPrice: 180,
				location: 'Полиця А-1',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Фільтр повітряний',
				sku: 'MANN-C27011',
				manufacturer: 'Mann',
				quantity: 15,
				buyPrice: 200,
				sellPrice: 300,
				location: 'Полиця А-2',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Колодки гальмівні передні',
				sku: 'BREMBO-P85020',
				manufacturer: 'Brembo',
				quantity: 10,
				buyPrice: 1200,
				sellPrice: 1800,
				location: 'Полиця B-3',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Свічки запалювання',
				sku: 'NGK-BKR6E',
				manufacturer: 'NGK',
				quantity: 40,
				buyPrice: 80,
				sellPrice: 150,
				location: 'Полиця C-1',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Мастило моторне 5W-40',
				sku: 'CASTROL-5W40-5L',
				manufacturer: 'Castrol',
				quantity: 30,
				buyPrice: 850,
				sellPrice: 1200,
				location: 'Склад D-1',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Фільтр паливний',
				sku: 'MAHLE-KL440',
				manufacturer: 'Mahle',
				quantity: 18,
				buyPrice: 250,
				sellPrice: 380,
				location: 'Полиця А-3',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Колодки гальмівні задні',
				sku: 'BREMBO-P85021',
				manufacturer: 'Brembo',
				quantity: 12,
				buyPrice: 1000,
				sellPrice: 1500,
				location: 'Полиця B-4',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Ремінь ГРМ',
				sku: 'GATES-5568XS',
				manufacturer: 'Gates',
				quantity: 8,
				buyPrice: 600,
				sellPrice: 950,
				location: 'Полиця C-2',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Акумулятор 60Ah',
				sku: 'VARTA-D59',
				manufacturer: 'Varta',
				quantity: 5,
				buyPrice: 2200,
				sellPrice: 3000,
				location: 'Склад D-2',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Диски гальмівні передні',
				sku: 'ATE-24032501511',
				manufacturer: 'ATE',
				quantity: 6,
				buyPrice: 1800,
				sellPrice: 2600,
				location: 'Полиця B-5',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Амортизатор передній',
				sku: 'SACHS-313555',
				manufacturer: 'Sachs',
				quantity: 10,
				buyPrice: 1500,
				sellPrice: 2200,
				location: 'Полиця E-1',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Помпа водяна',
				sku: 'HEPU-P517',
				manufacturer: 'Hepu',
				quantity: 7,
				buyPrice: 800,
				sellPrice: 1250,
				location: 'Полиця C-3',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Термостат',
				sku: 'WAHLER-410479D',
				manufacturer: 'Wahler',
				quantity: 14,
				buyPrice: 350,
				sellPrice: 550,
				location: 'Полиця C-4',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Стійка стабілізатора',
				sku: 'LEMFORDER-37416',
				manufacturer: 'Lemförder',
				quantity: 20,
				buyPrice: 200,
				sellPrice: 320,
				location: 'Полиця E-2',
			},
		}),
		prisma.part.create({
			data: {
				name: 'Лампа H7 12V',
				sku: 'OSRAM-64210',
				manufacturer: 'Osram',
				quantity: 50,
				buyPrice: 80,
				sellPrice: 140,
				location: 'Полиця F-1',
			},
		}),
	]);

	console.log('✅ Created 15 parts');

	// 5. Create Services - 15 services
	const services = await Promise.all([
		prisma.service.create({
			data: {
				name: 'Заміна мастила та фільтрів',
				pricePerHour: 400,
				estimatedTime: 1.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна гальмівних колодок',
				pricePerHour: 500,
				estimatedTime: 2.0,
			},
		}),
		prisma.service.create({
			data: {
				name: "Комп'ютерна діагностика",
				pricePerHour: 300,
				estimatedTime: 0.5,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Розвал-сходження',
				pricePerHour: 600,
				estimatedTime: 1.5,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт двигуна',
				pricePerHour: 800,
				estimatedTime: 8.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна ременя ГРМ',
				pricePerHour: 700,
				estimatedTime: 3.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна амортизаторів',
				pricePerHour: 600,
				estimatedTime: 2.5,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт ходової частини',
				pricePerHour: 650,
				estimatedTime: 4.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна зчеплення',
				pricePerHour: 850,
				estimatedTime: 5.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт кондиціонера',
				pricePerHour: 550,
				estimatedTime: 2.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна свічок запалювання',
				pricePerHour: 350,
				estimatedTime: 0.75,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Балансування коліс',
				pricePerHour: 400,
				estimatedTime: 1.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Заміна акумулятора',
				pricePerHour: 200,
				estimatedTime: 0.5,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Чистка інжектора',
				pricePerHour: 750,
				estimatedTime: 3.0,
			},
		}),
		prisma.service.create({
			data: {
				name: 'Ремонт електрики',
				pricePerHour: 600,
				estimatedTime: 2.0,
			},
		}),
	]);

	console.log('✅ Created 15 services');

	// 6. Create Orders - 15 orders
	const orders = [];

	// Order 1
	const order1 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Планова заміна мастила',
			totalAmount: 1980,
			priority: OrderPriority.MEDIUM,
			vehicleId: vehicles[0].id,
			clientId: clients[0].id,
			managerId: manager1.id,
			mechanicId: mechanics[0].id,
			startDate: new Date('2026-01-15'),
			endDate: new Date('2026-01-15'),
		},
	});
	orders.push(order1);
	await prisma.orderPart.create({
		data: { orderId: order1.id, partId: parts[0].id, quantity: 1, price: 180 },
	});
	await prisma.orderPart.create({
		data: { orderId: order1.id, partId: parts[4].id, quantity: 1, price: 1200 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order1.id,
			serviceId: services[0].id,
			quantity: 1.5,
			price: 400,
		},
	});

	// Order 2
	const order2 = await prisma.order.create({
		data: {
			status: OrderStatus.IN_PROGRESS,
			description: 'Заміна гальмівних колодок та діагностика',
			totalAmount: 2600,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[2].id,
			clientId: clients[2].id,
			managerId: manager1.id,
			mechanicId: mechanics[1].id,
			startDate: new Date('2026-01-28'),
		},
	});
	orders.push(order2);
	await prisma.orderPart.create({
		data: { orderId: order2.id, partId: parts[2].id, quantity: 1, price: 1800 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order2.id,
			serviceId: services[2].id,
			quantity: 1,
			price: 300,
		},
	});
	await prisma.orderService.create({
		data: {
			orderId: order2.id,
			serviceId: services[1].id,
			quantity: 1,
			price: 500,
		},
	});

	// Order 3
	const order3 = await prisma.order.create({
		data: {
			status: OrderStatus.NEW,
			description: 'Потрібна діагностика двигуна, троїть',
			totalAmount: 300,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[1].id,
			clientId: clients[1].id,
			managerId: manager2.id,
			startDate: new Date('2026-01-30'),
		},
	});
	orders.push(order3);
	await prisma.orderService.create({
		data: {
			orderId: order3.id,
			serviceId: services[2].id,
			quantity: 1,
			price: 300,
		},
	});

	// Order 4
	const order4 = await prisma.order.create({
		data: {
			status: OrderStatus.PAID,
			description: 'Розвал-сходження після ремонту підвіски',
			totalAmount: 900,
			priority: OrderPriority.LOW,
			vehicleId: vehicles[4].id,
			clientId: clients[3].id,
			managerId: manager1.id,
			mechanicId: mechanics[0].id,
			startDate: new Date('2026-01-20'),
			endDate: new Date('2026-01-20'),
		},
	});
	orders.push(order4);
	await prisma.orderService.create({
		data: {
			orderId: order4.id,
			serviceId: services[3].id,
			quantity: 1,
			price: 900,
		},
	});

	// Order 5
	const order5 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна свічок запалювання',
			totalAmount: 863,
			priority: OrderPriority.MEDIUM,
			vehicleId: vehicles[5].id,
			clientId: clients[4].id,
			managerId: manager2.id,
			mechanicId: mechanics[1].id,
			startDate: new Date('2026-01-25'),
			endDate: new Date('2026-01-25'),
		},
	});
	orders.push(order5);
	await prisma.orderPart.create({
		data: { orderId: order5.id, partId: parts[3].id, quantity: 4, price: 150 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order5.id,
			serviceId: services[10].id,
			quantity: 0.5,
			price: 263,
		},
	});

	// Order 6
	const order6 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна ременя ГРМ',
			totalAmount: 3050,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[6].id,
			clientId: clients[5].id,
			managerId: manager1.id,
			mechanicId: mechanics[2].id,
			startDate: new Date('2026-01-10'),
			endDate: new Date('2026-01-10'),
		},
	});
	orders.push(order6);
	await prisma.orderPart.create({
		data: { orderId: order6.id, partId: parts[7].id, quantity: 1, price: 950 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order6.id,
			serviceId: services[5].id,
			quantity: 3,
			price: 700,
		},
	});

	// Order 7
	const order7 = await prisma.order.create({
		data: {
			status: OrderStatus.WAITING_PARTS,
			description: 'Заміна амортизаторів',
			totalAmount: 5900,
			priority: OrderPriority.MEDIUM,
			vehicleId: vehicles[7].id,
			clientId: clients[6].id,
			managerId: manager2.id,
			mechanicId: mechanics[3].id,
			startDate: new Date('2026-01-27'),
		},
	});
	orders.push(order7);
	await prisma.orderPart.create({
		data: {
			orderId: order7.id,
			partId: parts[10].id,
			quantity: 2,
			price: 2200,
		},
	});
	await prisma.orderService.create({
		data: {
			orderId: order7.id,
			serviceId: services[6].id,
			quantity: 2.5,
			price: 600,
		},
	});

	// Order 8
	const order8 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна акумулятора',
			totalAmount: 3100,
			priority: OrderPriority.LOW,
			vehicleId: vehicles[8].id,
			clientId: clients[7].id,
			managerId: manager1.id,
			mechanicId: mechanics[4].id,
			startDate: new Date('2026-01-18'),
			endDate: new Date('2026-01-18'),
		},
	});
	orders.push(order8);
	await prisma.orderPart.create({
		data: { orderId: order8.id, partId: parts[8].id, quantity: 1, price: 3000 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order8.id,
			serviceId: services[12].id,
			quantity: 0.5,
			price: 200,
		},
	});

	// Order 9
	const order9 = await prisma.order.create({
		data: {
			status: OrderStatus.IN_PROGRESS,
			description: 'Ремонт ходової частини',
			totalAmount: 3280,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[9].id,
			clientId: clients[8].id,
			managerId: manager2.id,
			mechanicId: mechanics[5].id,
			startDate: new Date('2026-01-29'),
		},
	});
	orders.push(order9);
	await prisma.orderPart.create({
		data: { orderId: order9.id, partId: parts[13].id, quantity: 4, price: 320 },
	});
	await prisma.orderService.create({
		data: {
			orderId: order9.id,
			serviceId: services[7].id,
			quantity: 4,
			price: 650,
		},
	});

	// Order 10
	const order10 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Балансування та заміна шин',
			totalAmount: 400,
			priority: OrderPriority.LOW,
			vehicleId: vehicles[10].id,
			clientId: clients[9].id,
			managerId: manager1.id,
			mechanicId: mechanics[6].id,
			startDate: new Date('2026-01-12'),
			endDate: new Date('2026-01-12'),
		},
	});
	orders.push(order10);
	await prisma.orderService.create({
		data: {
			orderId: order10.id,
			serviceId: services[11].id,
			quantity: 1,
			price: 400,
		},
	});

	// Order 11
	const order11 = await prisma.order.create({
		data: {
			status: OrderStatus.PAID,
			description: 'Чистка інжектора',
			totalAmount: 2250,
			priority: OrderPriority.MEDIUM,
			vehicleId: vehicles[11].id,
			clientId: clients[10].id,
			managerId: manager2.id,
			mechanicId: mechanics[7].id,
			startDate: new Date('2026-01-22'),
			endDate: new Date('2026-01-22'),
		},
	});
	orders.push(order11);
	await prisma.orderService.create({
		data: {
			orderId: order11.id,
			serviceId: services[13].id,
			quantity: 3,
			price: 750,
		},
	});

	// Order 12
	const order12 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна гальмівних дисків',
			totalAmount: 5200,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[12].id,
			clientId: clients[11].id,
			managerId: manager1.id,
			mechanicId: mechanics[8].id,
			startDate: new Date('2026-01-08'),
			endDate: new Date('2026-01-08'),
		},
	});
	orders.push(order12);
	await prisma.orderPart.create({
		data: {
			orderId: order12.id,
			partId: parts[9].id,
			quantity: 2,
			price: 2600,
		},
	});
	await prisma.orderService.create({
		data: {
			orderId: order12.id,
			serviceId: services[1].id,
			quantity: 2,
			price: 500,
		},
	});

	// Order 13
	const order13 = await prisma.order.create({
		data: {
			status: OrderStatus.NEW,
			description: 'Ремонт електрики',
			totalAmount: 1200,
			priority: OrderPriority.MEDIUM,
			vehicleId: vehicles[13].id,
			clientId: clients[12].id,
			managerId: manager2.id,
			startDate: new Date('2026-01-31'),
		},
	});
	orders.push(order13);
	await prisma.orderService.create({
		data: {
			orderId: order13.id,
			serviceId: services[14].id,
			quantity: 2,
			price: 600,
		},
	});

	// Order 14
	const order14 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна помпи та термостата',
			totalAmount: 1800,
			priority: OrderPriority.HIGH,
			vehicleId: vehicles[14].id,
			clientId: clients[13].id,
			managerId: manager1.id,
			mechanicId: mechanics[9].id,
			startDate: new Date('2026-01-05'),
			endDate: new Date('2026-01-05'),
		},
	});
	orders.push(order14);
	await prisma.orderPart.create({
		data: {
			orderId: order14.id,
			partId: parts[11].id,
			quantity: 1,
			price: 1250,
		},
	});
	await prisma.orderPart.create({
		data: {
			orderId: order14.id,
			partId: parts[12].id,
			quantity: 1,
			price: 550,
		},
	});

	// Order 15
	const order15 = await prisma.order.create({
		data: {
			status: OrderStatus.COMPLETED,
			description: 'Заміна ламп освітлення',
			totalAmount: 280,
			priority: OrderPriority.LOW,
			vehicleId: vehicles[0].id,
			clientId: clients[14].id,
			managerId: manager2.id,
			mechanicId: mechanics[10].id,
			startDate: new Date('2026-01-16'),
			endDate: new Date('2026-01-16'),
		},
	});
	orders.push(order15);
	await prisma.orderPart.create({
		data: {
			orderId: order15.id,
			partId: parts[14].id,
			quantity: 2,
			price: 140,
		},
	});

	console.log('✅ Created 15 orders with parts and services');

	// 7. Update denormalized fields for all clients
	console.log('🔄 Syncing denormalized data...');

	for (const client of clients) {
		const [vehicleCount, orderStats, latestOrder] = await Promise.all([
			prisma.vehicle.count({ where: { ownerId: client.id } }),
			prisma.order.aggregate({
				where: { clientId: client.id },
				_count: true,
				_sum: { totalAmount: true },
			}),
			prisma.order.findFirst({
				where: { clientId: client.id },
				orderBy: { startDate: 'desc' },
				select: { startDate: true },
			}),
		]);

		await prisma.client.update({
			where: { id: client.id },
			data: {
				vehicleCount,
				totalOrders: orderStats._count,
				totalSpent: orderStats._sum.totalAmount || 0,
				latestVisit: latestOrder?.startDate || null,
			},
		});
	}

	console.log('✅ Synced denormalized data for all 15 clients');

	// 8. Create Documents (optional)
	await prisma.document.create({
		data: {
			filename: 'VW_Golf_Service_Manual.pdf',
			content:
				'Інструкція з обслуговування Volkswagen Golf 2015... Двигун 1.6 TDI...',
		},
	});

	await prisma.document.create({
		data: {
			filename: 'BMW_X5_Technical_Guide.pdf',
			content: 'Технічний довідник BMW X5 2018... Система xDrive...',
		},
	});

	console.log('✅ Created documents');

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
