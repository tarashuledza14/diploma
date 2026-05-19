import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import "dotenv/config";
import {
  ClientType,
  Currency,
  InviteLanguage,
  JobStatus,
  MovementType,
  NotificationType,
  OrderPriority,
  OrderStatus,
  PartCondition,
  PrismaClient,
  Role,
  VehicleStatus,
} from "./generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const seedNow = new Date("2026-05-04T10:00:00.000Z");

function daysAgo(days: number) {
  return new Date(seedNow.getTime() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number) {
  return new Date(seedNow.getTime() - hours * 60 * 60 * 1000);
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

async function clearDatabase() {
  console.log("🗑️  Clearing database...");

  await prisma.stockMovement.deleteMany({});
  await prisma.orderPart.deleteMany({});
  await prisma.orderService.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.teamInvite.deleteMany({});

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
  await prisma.manualOriginalChunk.deleteMany({});
  await prisma.appSettings.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  await prisma.$executeRawUnsafe(
    'ALTER SEQUENCE "orders_order_number_seq" RESTART WITH 1;',
  );
}

type CreatedUser = Awaited<ReturnType<typeof prisma.user.create>>;
type CreatedClient = Awaited<ReturnType<typeof prisma.client.create>>;
type CreatedVehicle = Awaited<ReturnType<typeof prisma.vehicle.create>>;

type SeedPart = {
  key: string;
  code: string;
  name: string;
  sku: string;
  oem?: string;
  barcode?: string;
  unit: string;
  minStock: number;
  condition: PartCondition;
  category: string;
  brand: string;
  manufacturer: string;
  supplier: string;
  notes?: string;
  compatibility?: string[];
  crossNumbers?: string[];
  weight?: string;
  dimensions?: string;
  warrantyKm?: number;
  inventory: Array<{
    quantity: number;
    purchasePrice: number;
    location?: string;
    batchNumber?: string;
    receivedAt: Date;
  }>;
  priceRules: Array<{
    clientType?: ClientType;
    markupPercent?: number;
    fixedPrice?: number;
  }>;
  stockMovements?: Array<{
    type: MovementType;
    quantity: number;
    reason: string;
    createdAt: Date;
  }>;
};

type SeedService = {
  key: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: number;
  category: string;
  requiredCategories?: string[];
};

type SeedOrder = {
  key: string;
  status: OrderStatus;
  vehicle: string;
  client: string;
  manager: string;
  mechanic?: string | null;
  description: string;
  priority: OrderPriority;
  startDate: Date;
  endDate?: Date | null;
  discount?: number;
  recommendations?: string;
  parts?: Array<{
    part: string;
    quantity: number;
    price: number;
  }>;
  services?: Array<{
    service: string;
    quantity: number;
    price: number;
    status: JobStatus;
    estimatedHours: number;
    additionalHours?: number;
    deadline?: Date | null;
    mechanic?: string | null;
  }>;
};

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("⏭️  Database already seeded, skipping...");
    return;
  }

  await clearDatabase();
  console.log("🚀 Starting seed...");

  const testPassword = "password123";
  const password = await argon2.hash(testPassword);

  const partCategoryNames = [
    "Filters",
    "Brakes",
    "Fluids",
    "Electrical",
    "Suspension",
    "Engine",
    "Lighting",
    "Cooling",
  ] as const;

  const serviceCategoryNames = [
    "Діагностика",
    "Ремонт",
    "Заміна",
    "Обслуговування",
    "Електрика",
  ] as const;

  const partCategories = await Promise.all(
    partCategoryNames.map((name) =>
      prisma.partCategory.create({ data: { name } }),
    ),
  );
  const serviceCategories = await Promise.all(
    serviceCategoryNames.map((name) =>
      prisma.serviceCategory.create({ data: { name } }),
    ),
  );

  const categoryByName = Object.fromEntries(
    partCategories.map((category) => [category.name, category]),
  );
  const serviceCategoryByName = Object.fromEntries(
    serviceCategories.map((category) => [category.name, category]),
  );

  const entityNames = [
    "Bosch",
    "Mann",
    "Brembo",
    "NGK",
    "Castrol",
    "Mahle",
    "ATE",
    "Sachs",
    "Contitech",
    "Osram",
    "Pierburg",
    "Lemförder",
    "Wahler",
    "Hella",
    "Beru",
  ] as const;

  const brands = await Promise.all(
    entityNames.map((name) => prisma.partsBrand.create({ data: { name } })),
  );
  const manufacturers = await Promise.all(
    entityNames.map((name) =>
      prisma.partsManufacturer.create({ data: { name } }),
    ),
  );
  const suppliers = await Promise.all(
    entityNames.map((name) =>
      prisma.partsSupplier.create({
        data: { name: `${name} Ukraine`, contact: "+380440000000" },
      }),
    ),
  );

  const brandByName = Object.fromEntries(
    brands.map((item) => [item.name, item]),
  );
  const manufacturerByName = Object.fromEntries(
    manufacturers.map((item) => [item.name, item]),
  );
  const supplierByName = Object.fromEntries(
    suppliers.map((item) => [item.name.replace(/ Ukraine$/, ""), item]),
  );

  const organization = await prisma.organization.create({
    data: { name: "AutoCRM Enterprise" },
  });

  await prisma.appSettings.create({
    data: {
      organizationId: organization.id,
      appName: "AutoCRM Enterprise",
      currency: Currency.UAH,
    },
  });

  const staffSeedUsers = [
    {
      email: "admin@sto.com",
      fullName: "Адмін Головний",
      role: Role.ADMIN,
      lastLoginAt: daysAgo(1),
    },
    {
      email: "manager@sto.com",
      fullName: "Олег Менеджер",
      role: Role.MANAGER,
      lastLoginAt: daysAgo(2),
    },
    {
      email: "mechanic1@sto.com",
      fullName: "Іван Гайка",
      role: Role.MECHANIC,
      lastLoginAt: hoursAgo(10),
    },
    {
      email: "mechanic2@sto.com",
      fullName: "Петро Поршень",
      role: Role.MECHANIC,
      lastLoginAt: hoursAgo(14),
    },
    {
      email: "mechanic3@sto.com",
      fullName: "Андрій Турбін",
      role: Role.MECHANIC,
      lastLoginAt: hoursAgo(18),
    },
    {
      email: "mechanic4@sto.com",
      fullName: "Марко Руль",
      role: Role.MECHANIC,
      lastLoginAt: hoursAgo(24),
    },
  ] as const;

  const createdStaffUsers: CreatedUser[] = await Promise.all(
    staffSeedUsers.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          password,
          organizationId: organization.id,
        },
      }),
    ),
  );

  const admin = createdStaffUsers.find((user) => user.role === Role.ADMIN)!;
  const manager = createdStaffUsers.find((user) => user.role === Role.MANAGER)!;
  const mechanics = createdStaffUsers.filter(
    (user) => user.role === Role.MECHANIC,
  );

  const clientsSeed = [
    {
      fullName: "Тарас Шевченко",
      phone: "+380671234567",
      email: "taras@gmail.com",
      notes: "VIP-клієнт, любить швидкий запис",
    },
    {
      fullName: "Марія Коваленко",
      phone: "+380502345678",
      email: "maria.kovalenko@ukr.net",
      notes: "Переважно обслуговує BMW",
    },
    {
      fullName: "Олександр Петренко",
      phone: "+380933456789",
      notes: "Любить детальні пояснення по ремонту",
    },
    {
      fullName: "Дмитро Бондаренко",
      phone: "+380661122334",
      email: "dmytro.bond@gmail.com",
      notes: "Корпоративний клієнт",
    },
    {
      fullName: "Наталія Іваненко",
      phone: "+380732233445",
      notes: "Охоче погоджує додаткові роботи",
    },
    {
      fullName: "Сергій Мельник",
      phone: "+380503344556",
      email: "s.melnyk@mail.com",
      notes: "Сімейний клієнт, 2 авто",
    },
    {
      fullName: "Аліна Ковчег",
      phone: "+380675551122",
      email: "alina.kovch@gmail.com",
      notes: "Часто замовляє діагностику",
    },
    {
      fullName: "Володимир Романюк",
      phone: "+380672224466",
      notes: "Потрібні регулярні ТО",
    },
  ] as const;

  const createdClients: CreatedClient[] = await Promise.all(
    clientsSeed.map((client) =>
      prisma.client.create({
        data: {
          ...client,
          organizationId: organization.id,
        },
      }),
    ),
  );

  const clientByName = Object.fromEntries(
    createdClients.map((client) => [client.fullName, client]),
  );

  const vehiclesSeed = [
    {
      vin: "1HGBH41JXMN109186",
      brand: "VW",
      model: "Golf",
      year: 2015,
      plateNumber: "АА1234ВВ",
      mileage: 120000,
      owner: "Тарас Шевченко",
      status: VehicleStatus.OUT,
    },
    {
      vin: "2HGBH41JXMN109187",
      brand: "BMW",
      model: "X5",
      year: 2018,
      plateNumber: "ВВ5678КК",
      mileage: 85000,
      owner: "Марія Коваленко",
      status: VehicleStatus.PENDING,
    },
    {
      vin: "3VWFE21C04M000001",
      brand: "Toyota",
      model: "Camry",
      year: 2020,
      plateNumber: "КК8800РР",
      mileage: 54000,
      owner: "Олександр Петренко",
      status: VehicleStatus.IN_SERVICE,
    },
    {
      vin: "4T1BF3EK6AU123456",
      brand: "Renault",
      model: "Logan",
      year: 2017,
      plateNumber: "МН4567ОП",
      mileage: 98000,
      owner: "Дмитро Бондаренко",
      status: VehicleStatus.IN_SERVICE,
    },
    {
      vin: "5FADP3F21EL001234",
      brand: "Ford",
      model: "Focus",
      year: 2016,
      plateNumber: "РС2233ТУ",
      mileage: 145000,
      owner: "Наталія Іваненко",
      status: VehicleStatus.PENDING,
    },
    {
      vin: "WAUZZZ8V6FA000111",
      brand: "Audi",
      model: "A4",
      year: 2019,
      plateNumber: "АІ9000ОМ",
      mileage: 71000,
      owner: "Сергій Мельник",
      status: VehicleStatus.READY,
    },
    {
      vin: "ZFA3120000D012345",
      brand: "Fiat",
      model: "Doblo",
      year: 2014,
      plateNumber: "АН3344КН",
      mileage: 167000,
      owner: "Аліна Ковчег",
      status: VehicleStatus.IN_SERVICE,
    },
    {
      vin: "WF0LXXGCBL4M11111",
      brand: "Ford",
      model: "Transit",
      year: 2021,
      plateNumber: "КМ7711ЕС",
      mileage: 62000,
      owner: "Володимир Романюк",
      status: VehicleStatus.TEST_DRIVE,
    },
  ] as const;

  const createdVehicles: CreatedVehicle[] = await Promise.all(
    vehiclesSeed.map((vehicle) =>
      prisma.vehicle.create({
        data: {
          vin: vehicle.vin,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          plateNumber: vehicle.plateNumber,
          mileage: vehicle.mileage,
          ownerId: clientByName[vehicle.owner].id,
          organizationId: organization.id,
          status: vehicle.status,
        },
      }),
    ),
  );

  const vehicleByPlate = Object.fromEntries(
    createdVehicles.map((vehicle) => [
      vehicle.plateNumber ?? vehicle.vin,
      vehicle,
    ]),
  );

  const partSeeds: SeedPart[] = [
    {
      key: "oil-filter",
      code: "PRT-001",
      name: "Фільтр масляний Bosch",
      sku: "BOSCH-0451103336",
      oem: "06A115561B",
      barcode: "4047024452361",
      unit: "шт",
      minStock: 5,
      condition: PartCondition.NEW,
      category: "Filters",
      brand: "Bosch",
      manufacturer: "Bosch",
      supplier: "Bosch",
      notes: "Преміальна лінійка, популярний складський товар.",
      compatibility: ["VW Golf IV", "Audi A3 8L", "Skoda Octavia Tour"],
      crossNumbers: ["MANN W719/30", "KNECHT OC264", "FILTRON OP526/1"],
      weight: "0.340 кг",
      dimensions: "76x76x123 мм",
      inventory: [
        {
          quantity: 15,
          purchasePrice: 120.5,
          location: "Сектор А, Полиця 1",
          batchNumber: "BATCH-2025-12",
          receivedAt: daysAgo(145),
        },
        {
          quantity: 10,
          purchasePrice: 125.0,
          location: "Сектор А, Полиця 2",
          batchNumber: "BATCH-2026-02",
          receivedAt: daysAgo(78),
        },
      ],
      priceRules: [
        { clientType: ClientType.RETAIL, markupPercent: 50, fixedPrice: 187.5 },
        {
          clientType: ClientType.WHOLESALE,
          markupPercent: 25,
          fixedPrice: 156.25,
        },
      ],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 15,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(145),
        },
        {
          type: MovementType.RECEIVED,
          quantity: 10,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(78),
        },
      ],
    },
    {
      key: "brake-pads",
      code: "PRT-002",
      name: "Колодки гальмівні передні Brembo",
      sku: "BREMBO-P85020",
      unit: "комплект",
      minStock: 2,
      condition: PartCondition.NEW,
      category: "Brakes",
      brand: "Brembo",
      manufacturer: "Brembo",
      supplier: "Brembo",
      notes: "Найчастіший товар для гальмівних робіт.",
      inventory: [
        {
          quantity: 4,
          purchasePrice: 1200,
          location: "Полиця B-3",
          receivedAt: daysAgo(50),
        },
        {
          quantity: 5,
          purchasePrice: 1220,
          location: "Полиця B-4",
          receivedAt: daysAgo(18),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 1800 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 4,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(50),
        },
        {
          type: MovementType.RECEIVED,
          quantity: 5,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(18),
        },
      ],
    },
    {
      key: "engine-oil",
      code: "PRT-003",
      name: "Мастило моторне Castrol EDGE 5W-40",
      sku: "CASTROL-5W40-5L",
      unit: "каністра (5л)",
      minStock: 10,
      condition: PartCondition.NEW,
      category: "Fluids",
      brand: "Castrol",
      manufacturer: "Castrol",
      supplier: "Castrol",
      notes: "Найкраще виглядає в підборках для ТО.",
      inventory: [
        {
          quantity: 24,
          purchasePrice: 850,
          location: "Склад ПММ",
          receivedAt: daysAgo(33),
        },
      ],
      priceRules: [
        { clientType: ClientType.RETAIL, markupPercent: 40, fixedPrice: 1190 },
        { clientType: ClientType.VIP, markupPercent: 32, fixedPrice: 1120 },
      ],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 24,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(33),
        },
      ],
    },
    {
      key: "spark-plugs",
      code: "PRT-004",
      name: "Свічки запалювання NGK",
      sku: "NGK-BKR6E",
      unit: "комплект",
      minStock: 6,
      condition: PartCondition.NEW,
      category: "Electrical",
      brand: "NGK",
      manufacturer: "NGK",
      supplier: "NGK",
      notes: "Пакет для популярних бензинових двигунів.",
      inventory: [
        {
          quantity: 40,
          purchasePrice: 80,
          location: "Сектор Е",
          receivedAt: daysAgo(61),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 150 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 40,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(61),
        },
      ],
    },
    {
      key: "cabin-filter",
      code: "PRT-005",
      name: "Фільтр салону Mann",
      sku: "MANN-CU2545",
      unit: "шт",
      minStock: 5,
      condition: PartCondition.NEW,
      category: "Filters",
      brand: "Mann",
      manufacturer: "Mann",
      supplier: "Mann",
      notes: "Низький залишок для скрінів по складу.",
      inventory: [
        {
          quantity: 4,
          purchasePrice: 260,
          location: "Полиця C-1",
          receivedAt: daysAgo(19),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 390 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 4,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(19),
        },
      ],
    },
    {
      key: "headlight-bulb",
      code: "PRT-006",
      name: "Лампа фари Osram Night Breaker",
      sku: "OSRAM-H7-NB",
      unit: "шт",
      minStock: 4,
      condition: PartCondition.NEW,
      category: "Lighting",
      brand: "Osram",
      manufacturer: "Osram",
      supplier: "Osram",
      notes: "Під замовлення, зараз відсутня на складі.",
      inventory: [],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 280 }],
    },
    {
      key: "suspension-arm",
      code: "PRT-007",
      name: "Ричаг підвіски Lemförder",
      sku: "LEMF-36925",
      unit: "шт",
      minStock: 3,
      condition: PartCondition.NEW,
      category: "Suspension",
      brand: "Lemförder",
      manufacturer: "Lemförder",
      supplier: "Lemförder",
      notes: "Показує низький залишок і дорогий чек.",
      inventory: [
        {
          quantity: 3,
          purchasePrice: 2100,
          location: "Сектор S-2",
          receivedAt: daysAgo(24),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 3250 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 3,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(24),
        },
      ],
    },
    {
      key: "fuel-pump",
      code: "PRT-008",
      name: "Паливний насос Pierburg",
      sku: "PIERBURG-7.02701",
      unit: "шт",
      minStock: 2,
      condition: PartCondition.NEW,
      category: "Engine",
      brand: "Pierburg",
      manufacturer: "Pierburg",
      supplier: "Pierburg",
      notes: "Одна одиниця, після видачі стане нульовим.",
      inventory: [
        {
          quantity: 1,
          purchasePrice: 4200,
          location: "Сектор E-1",
          receivedAt: daysAgo(12),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 5900 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 1,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(12),
        },
      ],
    },
    {
      key: "thermostat",
      code: "PRT-009",
      name: "Термостат Wahler",
      sku: "WAHLER-410487D",
      unit: "шт",
      minStock: 4,
      condition: PartCondition.NEW,
      category: "Cooling",
      brand: "Wahler",
      manufacturer: "Wahler",
      supplier: "Wahler",
      notes: "Добре виглядає в списку доповнюваних робіт.",
      inventory: [
        {
          quantity: 7,
          purchasePrice: 540,
          location: "Полиця C-4",
          receivedAt: daysAgo(45),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 840 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 7,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(45),
        },
      ],
    },
    {
      key: "air-filter",
      code: "PRT-010",
      name: "Повітряний фільтр Mahle",
      sku: "MAHLE-LX2040",
      unit: "шт",
      minStock: 4,
      condition: PartCondition.NEW,
      category: "Filters",
      brand: "Mahle",
      manufacturer: "Mahle",
      supplier: "Mahle",
      notes: "Підходить для швидких ТО.",
      inventory: [
        {
          quantity: 8,
          purchasePrice: 180,
          location: "Сектор A-3",
          receivedAt: daysAgo(39),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 290 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 8,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(39),
        },
      ],
    },
    {
      key: "shock-absorber",
      code: "PRT-011",
      name: "Амортизатор Sachs",
      sku: "SACHS-312345",
      unit: "шт",
      minStock: 3,
      condition: PartCondition.NEW,
      category: "Suspension",
      brand: "Sachs",
      manufacturer: "Sachs",
      supplier: "Sachs",
      notes: "Мінімальний залишок для гарного KPI на складі.",
      inventory: [
        {
          quantity: 2,
          purchasePrice: 1580,
          location: "Сектор S-1",
          receivedAt: daysAgo(27),
        },
      ],
      priceRules: [{ clientType: ClientType.RETAIL, fixedPrice: 2490 }],
      stockMovements: [
        {
          type: MovementType.RECEIVED,
          quantity: 2,
          reason: "Початкове оприбуткування",
          createdAt: daysAgo(27),
        },
      ],
    },
  ];

  const partsByKey: Record<
    string,
    Awaited<ReturnType<typeof prisma.part.create>>
  > = {};

  for (const partSeed of partSeeds) {
    const createdPart = await prisma.part.create({
      data: {
        code: partSeed.code,
        name: partSeed.name,
        sku: partSeed.sku,
        oem: partSeed.oem,
        barcode: partSeed.barcode,
        unit: partSeed.unit,
        minStock: partSeed.minStock,
        condition: partSeed.condition,
        organization: {
          connect: { id: organization.id },
        },
        notes: partSeed.notes,
        compatibility: partSeed.compatibility,
        crossNumbers: partSeed.crossNumbers,
        weight: partSeed.weight,
        dimensions: partSeed.dimensions,
        warrantyKm: partSeed.warrantyKm,
        category: {
          connect: { id: categoryByName[partSeed.category].id },
        },
        brand: {
          connect: { id: brandByName[partSeed.brand].id },
        },
        manufacturer: {
          connect: { id: manufacturerByName[partSeed.manufacturer].id },
        },
        supplier: {
          connect: { id: supplierByName[partSeed.supplier].id },
        },
        inventory: partSeed.inventory.length
          ? {
              create: partSeed.inventory.map((item) => ({
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                location: item.location,
                batchNumber: item.batchNumber,
                receivedAt: item.receivedAt,
              })),
            }
          : undefined,
        priceRules: partSeed.priceRules.length
          ? {
              create: partSeed.priceRules.map((item) => ({
                clientType: item.clientType,
                markupPercent: item.markupPercent,
                fixedPrice: item.fixedPrice,
              })),
            }
          : undefined,
        stockMovements: partSeed.stockMovements?.length
          ? {
              create: partSeed.stockMovements.map((item) => ({
                type: item.type,
                quantity: item.quantity,
                reason: item.reason,
                createdAt: item.createdAt,
                userId: admin.id,
              })),
            }
          : undefined,
      },
    });

    partsByKey[partSeed.key] = createdPart;
  }

  const servicesSeed: SeedService[] = [
    {
      key: "oil-change",
      name: "Заміна мастила",
      description: "Комплексна заміна моторного мастила та фільтрів",
      price: 420,
      estimatedTime: 1,
      category: "Обслуговування",
      requiredCategories: ["Filters", "Fluids"],
    },
    {
      key: "brake-service",
      name: "Заміна гальмівних колодок",
      description: "Заміна передніх або задніх гальмівних колодок",
      price: 560,
      estimatedTime: 2,
      category: "Заміна",
      requiredCategories: ["Brakes"],
    },
    {
      key: "computer-diagnostics",
      name: "Компʼютерна діагностика",
      description:
        "Зчитування помилок, перевірка основних систем та рекомендації",
      price: 390,
      estimatedTime: 1,
      category: "Діагностика",
    },
    {
      key: "spark-plugs-service",
      name: "Заміна свічок запалювання",
      description: "Заміна комплекту свічок запалювання та базова перевірка",
      price: 340,
      estimatedTime: 0.5,
      category: "Заміна",
      requiredCategories: ["Electrical"],
    },
    {
      key: "suspension-repair",
      name: "Ремонт підвіски",
      description: "Діагностика та заміна зношених елементів підвіски",
      price: 780,
      estimatedTime: 3,
      category: "Ремонт",
      requiredCategories: ["Suspension"],
    },
    {
      key: "electric-check",
      name: "Перевірка електрики",
      description: "Діагностика проводки, запобіжників і світлотехніки",
      price: 450,
      estimatedTime: 1.5,
      category: "Електрика",
      requiredCategories: ["Electrical", "Lighting"],
    },
    {
      key: "fuel-system",
      name: "Обслуговування паливної системи",
      description: "Перевірка тиску, насоса та паливної магістралі",
      price: 650,
      estimatedTime: 2,
      category: "Ремонт",
      requiredCategories: ["Engine"],
    },
    {
      key: "cooling-system",
      name: "Обслуговування системи охолодження",
      description:
        "Огляд термостата, патрубків та рівня охолоджувальної рідини",
      price: 520,
      estimatedTime: 1.5,
      category: "Обслуговування",
      requiredCategories: ["Cooling", "Fluids"],
    },
  ] as const;

  const servicesByKey: Record<
    string,
    Awaited<ReturnType<typeof prisma.service.create>>
  > = {};

  for (const serviceSeed of servicesSeed) {
    const createdService = await prisma.service.create({
      data: {
        name: serviceSeed.name,
        description: serviceSeed.description,
        price: serviceSeed.price,
        estimatedTime: serviceSeed.estimatedTime,
        organization: {
          connect: { id: organization.id },
        },
        category: {
          connect: { id: serviceCategoryByName[serviceSeed.category].id },
        },
        requiredCategories: serviceSeed.requiredCategories?.length
          ? {
              connect: serviceSeed.requiredCategories.map((category) => ({
                id: categoryByName[category].id,
              })),
            }
          : undefined,
      },
    });

    servicesByKey[serviceSeed.key] = createdService;
  }

  const clientTotals = new Map<
    string,
    { totalOrders: number; totalSpent: number; latestVisit: Date | null }
  >();
  const vehicleTotals = new Map<
    string,
    { totalServices: number; lastService: Date | null }
  >();

  async function consumeInventory(partId: string, quantity: number) {
    let remaining = quantity;
    const batches = await prisma.partInventory.findMany({
      where: { partId },
      orderBy: [{ receivedAt: "asc" }, { id: "asc" }],
      select: { id: true, quantity: true },
    });

    for (const batch of batches) {
      if (remaining <= 0) {
        break;
      }

      const toConsume = Math.min(batch.quantity, remaining);
      if (toConsume <= 0) {
        continue;
      }

      await prisma.partInventory.update({
        where: { id: batch.id },
        data: {
          quantity: { decrement: toConsume },
        },
      });

      remaining -= toConsume;
    }
  }

  async function createOrder(seed: SeedOrder) {
    const vehicle = vehicleByPlate[seed.vehicle];
    const client = clientByName[seed.client];
    const manager = createdStaffUsers.find(
      (user) => user.fullName === seed.manager,
    )!;
    const mechanic = seed.mechanic
      ? (createdStaffUsers.find((user) => user.fullName === seed.mechanic) ??
        null)
      : null;

    const partsTotal = (seed.parts ?? []).reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const servicesTotal = (seed.services ?? []).reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const totalAmount = partsTotal + servicesTotal;

    const order = await prisma.order.create({
      data: {
        status: seed.status,
        description: seed.description,
        totalAmount,
        priority: seed.priority,
        vehicleId: vehicle.id,
        clientId: client.id,
        managerId: manager.id,
        mechanicId: mechanic?.id ?? null,
        mileage: vehicle.mileage,
        discount: seed.discount ?? 0,
        recommendations: seed.recommendations ?? null,
        startDate: seed.startDate,
        endDate: seed.endDate ?? null,
      },
    });

    for (const item of seed.parts ?? []) {
      const part = partsByKey[item.part];
      await prisma.orderPart.create({
        data: {
          orderId: order.id,
          partId: part.id,
          quantity: item.quantity,
          price: item.price,
        },
      });

      await consumeInventory(part.id, item.quantity);

      await prisma.stockMovement.create({
        data: {
          partId: part.id,
          type: MovementType.ISSUED,
          quantity: -item.quantity,
          reason: "Видано для ремонтного замовлення",
          orderId: order.id,
          userId: mechanic?.id ?? manager.id,
          createdAt: addDays(seed.startDate, 0),
        },
      });
    }

    for (const item of seed.services ?? []) {
      await prisma.orderService.create({
        data: {
          orderId: order.id,
          serviceId: servicesByKey[item.service].id,
          quantity: item.quantity,
          price: item.price,
          mechanicId: item.mechanic
            ? (createdStaffUsers.find((user) => user.fullName === item.mechanic)
                ?.id ??
              mechanic?.id ??
              null)
            : (mechanic?.id ?? null),
          estimatedHours: item.estimatedHours,
          additionalHours: item.additionalHours ?? 0,
          deadline: item.deadline ?? null,
          status: item.status,
        },
      });
    }

    const clientTotalsEntry = clientTotals.get(client.id) ?? {
      totalOrders: 0,
      totalSpent: 0,
      latestVisit: null,
    };
    clientTotalsEntry.totalOrders += 1;
    clientTotalsEntry.totalSpent += totalAmount;
    clientTotalsEntry.latestVisit = !clientTotalsEntry.latestVisit
      ? seed.startDate
      : clientTotalsEntry.latestVisit > seed.startDate
        ? clientTotalsEntry.latestVisit
        : seed.startDate;
    clientTotals.set(client.id, clientTotalsEntry);

    const vehicleTotalsEntry = vehicleTotals.get(vehicle.id) ?? {
      totalServices: 0,
      lastService: null,
    };
    vehicleTotalsEntry.totalServices += 1;
    vehicleTotalsEntry.lastService = !vehicleTotalsEntry.lastService
      ? (seed.endDate ?? seed.startDate)
      : vehicleTotalsEntry.lastService > (seed.endDate ?? seed.startDate)
        ? vehicleTotalsEntry.lastService
        : (seed.endDate ?? seed.startDate);
    vehicleTotals.set(vehicle.id, vehicleTotalsEntry);

    return order;
  }

  const ordersSeed: SeedOrder[] = [
    {
      key: "order-1",
      status: OrderStatus.COMPLETED,
      vehicle: "АА1234ВВ",
      client: "Тарас Шевченко",
      manager: "Олег Менеджер",
      mechanic: "Іван Гайка",
      description: "Планова заміна моторного мастила та фільтра",
      priority: OrderPriority.MEDIUM,
      startDate: daysAgo(12),
      endDate: daysAgo(11),
      recommendations:
        "Рекомендується оглянути гальмівну систему на наступному ТО.",
      parts: [
        { part: "oil-filter", quantity: 1, price: 187.5 },
        { part: "engine-oil", quantity: 1, price: 1190 },
      ],
      services: [
        {
          service: "oil-change",
          quantity: 1,
          price: 420,
          status: JobStatus.COMPLETED,
          estimatedHours: 1,
          deadline: daysAgo(11),
        },
      ],
    },
    {
      key: "order-2",
      status: OrderStatus.IN_PROGRESS,
      vehicle: "ВВ5678КК",
      client: "Марія Коваленко",
      manager: "Олег Менеджер",
      mechanic: "Петро Поршень",
      description: "Заміна передніх гальмівних колодок",
      priority: OrderPriority.HIGH,
      startDate: daysAgo(4),
      parts: [{ part: "brake-pads", quantity: 1, price: 1800 }],
      services: [
        {
          service: "brake-service",
          quantity: 1,
          price: 560,
          status: JobStatus.IN_PROGRESS,
          estimatedHours: 2,
          additionalHours: 0.5,
          deadline: addDays(daysAgo(4), 1),
        },
      ],
    },
    {
      key: "order-3",
      status: OrderStatus.NEW,
      vehicle: "КК8800РР",
      client: "Олександр Петренко",
      manager: "Олег Менеджер",
      description: "Діагностика після перегріву двигуна",
      priority: OrderPriority.MEDIUM,
      startDate: daysAgo(2),
      services: [
        {
          service: "computer-diagnostics",
          quantity: 1,
          price: 390,
          status: JobStatus.PENDING,
          estimatedHours: 1,
          deadline: addDays(daysAgo(2), 1),
        },
      ],
    },
    {
      key: "order-4",
      status: OrderStatus.COMPLETED,
      vehicle: "МН4567ОП",
      client: "Дмитро Бондаренко",
      manager: "Олег Менеджер",
      mechanic: "Іван Гайка",
      description: "Заміна комплекту свічок запалювання",
      priority: OrderPriority.MEDIUM,
      startDate: daysAgo(15),
      endDate: daysAgo(14),
      parts: [{ part: "spark-plugs", quantity: 4, price: 150 }],
      services: [
        {
          service: "spark-plugs-service",
          quantity: 1,
          price: 340,
          status: JobStatus.COMPLETED,
          estimatedHours: 0.5,
          deadline: daysAgo(14),
        },
      ],
    },
    {
      key: "order-5",
      status: OrderStatus.WAITING_PARTS,
      vehicle: "РС2233ТУ",
      client: "Наталія Іваненко",
      manager: "Олег Менеджер",
      mechanic: "Андрій Турбін",
      description: "Обслуговування системи охолодження з очікуванням запчастин",
      priority: OrderPriority.HIGH,
      startDate: daysAgo(3),
      services: [
        {
          service: "cooling-system",
          quantity: 1,
          price: 520,
          status: JobStatus.WAITING_FOR_PARTS,
          estimatedHours: 1.5,
          additionalHours: 0.5,
          deadline: addDays(daysAgo(3), 2),
        },
      ],
    },
    {
      key: "order-6",
      status: OrderStatus.PAID,
      vehicle: "АІ9000ОМ",
      client: "Сергій Мельник",
      manager: "Олег Менеджер",
      mechanic: "Петро Поршень",
      description: "Комплексне ТО після 70 000 км",
      priority: OrderPriority.LOW,
      startDate: daysAgo(9),
      endDate: daysAgo(8),
      discount: 5,
      recommendations: "Замінити гальмівну рідину через 6 місяців.",
      parts: [
        { part: "oil-filter", quantity: 1, price: 187.5 },
        { part: "engine-oil", quantity: 1, price: 1190 },
        { part: "air-filter", quantity: 1, price: 290 },
      ],
      services: [
        {
          service: "oil-change",
          quantity: 1,
          price: 420,
          status: JobStatus.COMPLETED,
          estimatedHours: 1,
          deadline: daysAgo(8),
        },
        {
          service: "computer-diagnostics",
          quantity: 1,
          price: 390,
          status: JobStatus.COMPLETED,
          estimatedHours: 1,
          deadline: daysAgo(8),
        },
      ],
    },
    {
      key: "order-7",
      status: OrderStatus.CANCELLED,
      vehicle: "АН3344КН",
      client: "Аліна Ковчег",
      manager: "Олег Менеджер",
      description: "Попередня оцінка ремонту електрики",
      priority: OrderPriority.MEDIUM,
      startDate: daysAgo(1),
      services: [
        {
          service: "electric-check",
          quantity: 1,
          price: 450,
          status: JobStatus.PENDING,
          estimatedHours: 1.5,
          deadline: addDays(daysAgo(1), 1),
        },
      ],
    },
    {
      key: "order-8",
      status: OrderStatus.IN_PROGRESS,
      vehicle: "КМ7711ЕС",
      client: "Володимир Романюк",
      manager: "Олег Менеджер",
      mechanic: "Марко Руль",
      description: "Перевірка паливної системи та заміна насоса",
      priority: OrderPriority.HIGH,
      startDate: daysAgo(5),
      parts: [{ part: "fuel-pump", quantity: 1, price: 5900 }],
      services: [
        {
          service: "fuel-system",
          quantity: 1,
          price: 650,
          status: JobStatus.IN_PROGRESS,
          estimatedHours: 2,
          additionalHours: 1,
          deadline: addDays(daysAgo(5), 2),
        },
      ],
    },
    {
      key: "order-9",
      status: OrderStatus.COMPLETED,
      vehicle: "КК8800РР",
      client: "Олександр Петренко",
      manager: "Олег Менеджер",
      mechanic: "Іван Гайка",
      description: "Ремонт підвіски після вибою",
      priority: OrderPriority.HIGH,
      startDate: daysAgo(20),
      endDate: daysAgo(19),
      parts: [{ part: "suspension-arm", quantity: 1, price: 3250 }],
      services: [
        {
          service: "suspension-repair",
          quantity: 1,
          price: 780,
          status: JobStatus.COMPLETED,
          estimatedHours: 3,
          deadline: daysAgo(19),
        },
      ],
    },
    {
      key: "order-10",
      status: OrderStatus.NEW,
      vehicle: "АА1234ВВ",
      client: "Тарас Шевченко",
      manager: "Олег Менеджер",
      description: "Плановий огляд перед дальньою поїздкою",
      priority: OrderPriority.LOW,
      startDate: hoursAgo(14),
      services: [
        {
          service: "computer-diagnostics",
          quantity: 1,
          price: 390,
          status: JobStatus.PENDING,
          estimatedHours: 1,
          deadline: addDays(hoursAgo(14), 1),
        },
      ],
    },
  ];

  const createdOrders = [] as Awaited<ReturnType<typeof prisma.order.create>>[];
  for (const orderSeed of ordersSeed) {
    createdOrders.push(await createOrder(orderSeed));
  }

  for (const [clientId, totals] of clientTotals.entries()) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalOrders: totals.totalOrders,
        totalSpent: totals.totalSpent,
        latestVisit: totals.latestVisit,
      },
    });
  }

  const vehicleOrdersMap = new Map<string, SeedOrder[]>();
  for (const orderSeed of ordersSeed) {
    const vehicle = vehicleByPlate[orderSeed.vehicle];
    const existing = vehicleOrdersMap.get(vehicle.id) ?? [];
    existing.push(orderSeed);
    vehicleOrdersMap.set(vehicle.id, existing);
  }

  for (const [vehicleId, totals] of vehicleTotals.entries()) {
    const vehicleOrders = vehicleOrdersMap.get(vehicleId) ?? [];
    const latestOrder = vehicleOrders.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    )[0];
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        totalServices: totals.totalServices,
        lastService: totals.lastService,
        status: vehicleByPlate[latestOrder.vehicle].status,
      },
    });
  }

  const documentsSeed = [
    {
      filename: "Регламент_TO_VW_Golf_IV.pdf",
      content:
        "Регламент технічного обслуговування Volkswagen Golf IV.\n\n1. Заміна мастила кожні 10 000 км.\n2. Контроль гальмівної рідини кожні 12 місяців.\n3. Огляд підвіски при кожному плановому ТО.\n4. Перевірка тиску в шинах перед сезоном.",
      externalId: "manual-vw-golf-iv",
      createdAt: daysAgo(9),
    },
    {
      filename: "Карта_робіт_BMW_X5.pdf",
      content:
        "Карта сервісних робіт BMW X5.\n\n- Діагностика електроніки\n- Перевірка підвіски\n- Заміна гальмівних колодок\n- Адаптація сервісного інтервалу",
      externalId: "manual-bmw-x5",
      createdAt: daysAgo(6),
    },
    {
      filename: "Складський_чеклист_приймання.pdf",
      content:
        "Чек-лист приймання товару на склад.\n\n1. Перевірити SKU та артикул.\n2. Звірити кількість по накладній.\n3. Внести партію у складську систему.\n4. Привʼязати локацію та ціну закупівлі.",
      externalId: "warehouse-receipt-checklist",
      createdAt: daysAgo(4),
    },
    {
      filename: "Інструкція_з_діагностики_електрики.pdf",
      content:
        "Інструкція для електродіагностики.\n\nОписує послідовність перевірки запобіжників, мас, напруги живлення та помилок ECU.\nРекомендації підходять для швидкої консультації майстра.",
      externalId: "electric-diagnostics-guide",
      createdAt: daysAgo(2),
    },
  ] as const;

  await Promise.all(
    documentsSeed.map((document) =>
      prisma.document.create({
        data: {
          ...document,
          organizationId: organization.id,
        },
      }),
    ),
  );

  const chatSessionsSeed = [
    {
      title: "Підбір запчастин для VW Golf",
      messages: [
        {
          role: "USER" as const,
          content: "Є зараз масляний фільтр і мастило для Golf?",
          createdAt: daysAgo(1),
        },
        {
          role: "ASSISTANT" as const,
          content:
            "Так, на складі є 22 фільтри Bosch і 23 каністри Castrol. Для повного ТО вистачить без дозамовлення.",
          createdAt: daysAgo(1),
        },
        {
          role: "USER" as const,
          content: "Добре, додай ще повітряний фільтр.",
          createdAt: hoursAgo(18),
        },
        {
          role: "ASSISTANT" as const,
          content:
            "Додав у підбірку. Повітряний фільтр Mahle є в наявності, підходить під планове ТО.",
          createdAt: hoursAgo(18),
        },
      ],
    },
    {
      title: "Статус замовлення №4",
      messages: [
        {
          role: "USER" as const,
          content: "Що по замовленню на заміну свічок?",
          createdAt: daysAgo(3),
        },
        {
          role: "ASSISTANT" as const,
          content:
            "Замовлення №4 вже завершене. Встановлено комплект NGK, авто готове до видачі.",
          createdAt: daysAgo(3),
        },
        {
          role: "USER" as const,
          content: "Чудово, дякую!",
          createdAt: daysAgo(3),
        },
      ],
    },
    {
      title: "Склад та низькі залишки",
      messages: [
        {
          role: "USER" as const,
          content: "Які позиції треба дозамовити найближчим часом?",
          createdAt: hoursAgo(6),
        },
        {
          role: "ASSISTANT" as const,
          content:
            "Найнижчі залишки зараз по салонному фільтру Mann, амортизаторах Sachs і лампах Osram. Рекомендую поповнити ці SKU першими.",
          createdAt: hoursAgo(6),
        },
      ],
    },
  ] as const;

  for (const chatSeed of chatSessionsSeed) {
    const session = await prisma.chatSession.create({
      data: {
        title: chatSeed.title,
        userId: admin.id,
      },
    });

    await prisma.chatMessage.createMany({
      data: chatSeed.messages.map((message) => ({
        chatId: session.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    });
  }

  const notificationsSeed = [
    {
      userId: admin.id,
      type: NotificationType.ORDER_CREATED,
      title: "Нове замовлення",
      message: `Створено замовлення №${createdOrders[9].orderNumber} для Тараса Шевченка.`,
      isRead: false,
      createdAt: hoursAgo(2),
    },
    {
      userId: manager.id,
      type: NotificationType.ORDER_UPDATED,
      title: "Замовлення оновлено",
      message: `Замовлення №${createdOrders[1].orderNumber} переведено у статус «В роботі».`,
      isRead: false,
      createdAt: hoursAgo(4),
    },
    {
      userId: mechanics[0].id,
      type: NotificationType.ORDER_COMPLETED,
      title: "Роботу завершено",
      message: `Замовлення №${createdOrders[0].orderNumber} закрито та готове до видачі клієнту.`,
      isRead: true,
      createdAt: daysAgo(1),
    },
    {
      userId: mechanics[1].id,
      type: NotificationType.PART_DELIVERED,
      title: "Поставка на склад",
      message: "На склад надійшла партія гальмівних колодок Brembo.",
      isRead: false,
      createdAt: daysAgo(2),
    },
    {
      userId: admin.id,
      type: NotificationType.SYSTEM,
      title: "Підсумок дня",
      message: "За день створено 10 замовлень, 4 з них завершено.",
      isRead: true,
      createdAt: daysAgo(1),
    },
    {
      userId: manager.id,
      type: NotificationType.SYSTEM,
      title: "Низькі залишки",
      message: "Фільтр салону Mann і лампи Osram треба дозамовити.",
      isRead: true,
      createdAt: hoursAgo(9),
    },
  ] as const;

  await prisma.notification.createMany({
    data: notificationsSeed.map((notification) => ({
      ...notification,
      metadata:
        notification.type === NotificationType.ORDER_CREATED ||
        notification.type === NotificationType.ORDER_UPDATED
          ? {
              orderNumber:
                notification.type === NotificationType.ORDER_CREATED
                  ? createdOrders[9].orderNumber
                  : createdOrders[1].orderNumber,
            }
          : undefined,
    })),
  });

  await prisma.teamInvite.createMany({
    data: [
      {
        userId: admin.id,
        organizationId: organization.id,
        createdById: admin.id,
        email: "oleksii.pryima@sto.com",
        role: Role.MECHANIC,
        language: InviteLanguage.UK,
        tokenHash: "seed-invite-mechanic-1",
        expiresAt: addDays(seedNow, 7),
      },
      {
        userId: manager.id,
        organizationId: organization.id,
        createdById: admin.id,
        email: "iryna.koval@sto.com",
        role: Role.MANAGER,
        language: InviteLanguage.EN,
        tokenHash: "seed-invite-manager-1",
        expiresAt: addDays(seedNow, 3),
        usedAt: daysAgo(1),
      },
    ],
  });

  console.log(
    "✅ Dictionaries, users, clients, vehicles, parts, services and app settings created",
  );
  console.log(
    "✅ Orders, stock movements, documents, chats, notifications and invites created",
  );
  console.log("🔐 Test users credentials:");
  for (const user of createdStaffUsers) {
    console.log(`   ${user.role}: ${user.email} / ${testPassword}`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
