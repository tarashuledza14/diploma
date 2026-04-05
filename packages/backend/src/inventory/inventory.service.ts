import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from 'prisma/generated/prisma/client';
import { FilterService } from 'src/filter/filter.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInventoryDto } from './dto/get-inventory.dto';

@Injectable()
export class InventoryService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
		private readonly notificationsService: NotificationsService,
	) {}

	async createPart(
		data: Omit<
			Prisma.PartCreateInput,
			| 'category'
			| 'brand'
			| 'manufacturer'
			| 'supplier'
			| 'inventory'
			| 'priceRules'
		> & {
			category: { id: string };
			brand: { id: string };
			manufacturer?: { id: string } | null;
			supplier?: { id: string } | null;
			inventory?: Prisma.PartInventoryCreateWithoutPartInput[];
			priceRules?: Prisma.PartPriceRuleCreateWithoutPartInput[];
		},
	) {
		const {
			category,
			brand,
			manufacturer,
			supplier,
			inventory,
			priceRules,
			...rest
		} = data;

		// ДОДАНО: Дістаємо початкову кількість для запису в історію
		const initialQty = inventory?.[0]?.quantity
			? Number(inventory[0].quantity)
			: 0;

		return this.db.part.create({
			data: {
				...rest,
				category: { connect: { id: category.id } },
				brand: { connect: { id: brand.id } },

				...(manufacturer?.id && {
					manufacturer: { connect: { id: manufacturer.id } },
				}),
				...(supplier?.id && { supplier: { connect: { id: supplier.id } } }),

				...(inventory?.length && { inventory: { create: inventory } }),
				...(priceRules?.length && { priceRules: { create: priceRules } }),

				// ДОДАНО: Створення запису про рух товару (Прихід)
				...(initialQty > 0 && {
					movements: {
						create: {
							type: 'RECEIVED',
							quantity: initialQty,
							reason: 'Initial stock setup',
						},
					},
				}),
			},
			include: {
				category: true,
				brand: true,
				inventory: true,
				priceRules: true,
			},
		});
	}

	async updatePart(
		data: any, // Приймаємо дані
	) {
		console.log('data', data);
		const {
			id,
			category,
			brand,
			manufacturer,
			supplier,
			createdAt,
			updatedAt,
			inventory,
			priceRules,
			...rest
		} = data;

		if (!id) {
			throw new Error('Part ID is required for update');
		}

		// ДОДАНО: 1. Витягуємо поточну запчастину з бази, щоб дізнатись СТАРУ кількість
		const currentPart = await this.db.part.findUnique({
			where: { id },
			include: { inventory: true },
		});

		const oldQty = currentPart?.inventory?.[0]?.quantity || 0;
		const newQty =
			inventory?.[0]?.quantity !== undefined
				? Number(inventory[0].quantity)
				: oldQty;

		// Вираховуємо різницю (наприклад, було 10, стало 12 -> різниця +2)
		const qtyDifference = newQty - oldQty;

		// 2. Оновлюємо саму запчастину
		const updatedPart = await this.db.part.update({
			where: { id },
			data: {
				...rest,
				...(category?.id && { category: { connect: { id: category.id } } }),
				...(brand?.id && { brand: { connect: { id: brand.id } } }),

				manufacturer: manufacturer?.id
					? { connect: { id: manufacturer.id } }
					: manufacturer === null
						? { disconnect: true }
						: undefined,

				supplier: supplier?.id
					? { connect: { id: supplier.id } }
					: supplier === null
						? { disconnect: true }
						: undefined,

				...(priceRules?.length && {
					priceRules: {
						updateMany: {
							where: { clientType: priceRules[0].clientType },
							data: { fixedPrice: priceRules[0].fixedPrice },
						},
					},
				}),

				...(inventory?.length && {
					inventory: {
						updateMany: {
							where: {},
							data: {
								quantity: newQty, // Оновлюємо кількість
								location: inventory[0].location,
								purchasePrice: inventory[0].purchasePrice,
							},
						},
					},
				}),
			},
			include: {
				category: true,
				brand: true,
				manufacturer: true,
				supplier: true,
				inventory: true,
				priceRules: true,
			},
		});

		// ДОДАНО: 3. Створюємо запис про коригування залишку (якщо кількість змінилася)
		if (qtyDifference !== 0) {
			await this.db.stockMovement.create({
				data: {
					partId: id,
					type: 'ADJUSTMENT',
					quantity: qtyDifference, // Буде + або -
					reason: 'Manual stock adjustment via edit form',
				},
			});

			if (qtyDifference > 0) {
				await this.notifyMechanicsAboutPartDelivery(
					id,
					updatedPart.name,
					qtyDifference,
				);
			}
		}

		return updatedPart;
	}

	async getAll(input: GetInventoryDto) {
		const { skip, perPage } = this.paginationService.getPagination({
			page: input.page,
			perPage: input.perPage,
		});

		const filter = this.filterService.createFilter(
			input.filters,
			input.joinOperator,
			false,
		);

		const sortFilter = this.filterService.getSortFilter(input.sort);

		const [parts, total] = await Promise.all([
			this.db.part.findMany({
				where: filter,
				orderBy: sortFilter,
				skip,
				take: perPage,
				include: {
					category: true,
					brand: true,
					manufacturer: true,
					supplier: true,
					inventory: true,
					priceRules: true,
				},
				omit: {
					categoryId: true,
					brandId: true,
					manufacturerId: true,
					supplierId: true,
				},
			}),
			this.db.part.count({ where: filter }),
		]);

		return {
			data: parts,
			total,
			pageCount: this.paginationService.getPageCount(total, perPage),
		};
	}

	async getStatistics() {
		const parts = await this.db.part.findMany({
			select: {
				minStock: true,
				inventory: {
					select: { quantity: true, purchasePrice: true },
				},
				priceRules: {
					select: { clientType: true, fixedPrice: true },
				},
				orderParts: {
					where: {
						order: {
							status: {
								in: ['NEW', 'IN_PROGRESS', 'WAITING_PARTS'],
							},
						},
					},
					select: { quantity: true },
				},
			},
		});

		let totalParts = parts.length;
		let lowStock = 0;
		let outOfStock = 0;
		let purchasePrice = 0;
		let retailPrice = 0;
		let quantityReserved = 0;

		parts.forEach(part => {
			const partQuantity = part.inventory.reduce(
				(sum, item) => sum + item.quantity,
				0,
			);

			if (partQuantity === 0) {
				outOfStock++;
			} else if (partQuantity <= (part.minStock || 5)) {
				lowStock++;
			}

			part.inventory.forEach(inv => {
				purchasePrice += inv.quantity * Number(inv.purchasePrice || 0);
			});

			const retailRule =
				part.priceRules.find(r => r.clientType === 'RETAIL') ||
				part.priceRules[0];
			const partRetailPrice = retailRule?.fixedPrice
				? Number(retailRule.fixedPrice)
				: 0;
			retailPrice += partQuantity * partRetailPrice;

			const reserved = part.orderParts.reduce(
				(sum, op) => sum + op.quantity,
				0,
			);
			quantityReserved += reserved;
		});

		return {
			totalParts,
			lowStock,
			outOfStock,
			purchasePrice,
			retailPrice,
			quantityReserved,
		};
	}

	async getAllDictionaries() {
		const [brands, categories, manufacturers, suppliers] = await Promise.all([
			this.db.partsBrand.findMany(),
			this.db.partCategory.findMany(),
			this.db.partsManufacturer.findMany(),
			this.db.partsSupplier.findMany(),
		]);
		return {
			brands,
			categories,
			manufacturers,
			suppliers,
		};
	}

	// ДОДАНО: Метод для вікна Movement History
	async getPartMovementHistory(partId: string) {
		const movements = await this.db.stockMovement.findMany({
			where: { partId },
			orderBy: { createdAt: 'desc' }, // Нові зверху
			include: {
				user: { select: { fullName: true } },
				order: { select: { id: true } },
			},
		});

		const stats = {
			received: 0,
			issued: 0,
			reserved: 0,
			returned: 0,
		};

		movements.forEach(m => {
			if (m.type === 'RECEIVED') stats.received += m.quantity;
			if (m.type === 'ISSUED') stats.issued += Math.abs(m.quantity);
			if (m.type === 'RESERVED') stats.reserved += Math.abs(m.quantity);
			if (m.type === 'RETURNED') stats.returned += m.quantity;
		});

		return {
			stats,
			history: movements,
		};
	}
	async deleteBulk(ids: string[]) {
		await this.db.$transaction(async tx => {
			await tx.partInventory.deleteMany({
				where: { partId: { in: ids } },
			});
			await tx.partPriceRule.deleteMany({
				where: { partId: { in: ids } },
			});
			await tx.stockMovement.deleteMany({
				where: { partId: { in: ids } },
			});
			await tx.part.deleteMany({
				where: { id: { in: ids } },
			});
		});
	}

	private async notifyMechanicsAboutPartDelivery(
		partId: string,
		partName: string,
		deliveredQty: number,
	) {
		const relatedOrders = await this.db.order.findMany({
			where: {
				deletedAt: null,
				status: OrderStatus.WAITING_PARTS,
				parts: {
					some: {
						partId,
					},
				},
				OR: [
					{ mechanicId: { not: null } },
					{ services: { some: { mechanicId: { not: null } } } },
				],
			},
			select: {
				orderNumber: true,
				mechanicId: true,
				services: {
					select: {
						mechanicId: true,
					},
				},
			},
		});

		if (!relatedOrders.length) {
			return;
		}

		const mechanicIds = new Set<string>();
		for (const order of relatedOrders) {
			if (order.mechanicId) {
				mechanicIds.add(order.mechanicId);
			}
			for (const service of order.services) {
				if (service.mechanicId) {
					mechanicIds.add(service.mechanicId);
				}
			}
		}

		if (!mechanicIds.size) {
			return;
		}

		const mechanics = await this.db.user.findMany({
			where: {
				id: { in: [...mechanicIds] },
				role: Role.MECHANIC,
				deletedAt: null,
			},
			select: {
				id: true,
				role: true,
			},
		});

		const orderNumbers = [
			...new Set(relatedOrders.map(order => order.orderNumber)),
		];
		const preview = orderNumbers
			.slice(0, 3)
			.map(num => `№${num}`)
			.join(', ');
		const moreSuffix =
			orderNumbers.length > 3 ? ` та ще ${orderNumbers.length - 3}` : '';
		const ordersSuffix = preview ? ` Замовлення: ${preview}${moreSuffix}.` : '';

		await Promise.all(
			mechanics.map(mechanic =>
				this.notificationsService.notify({
					userId: mechanic.id,
					role: mechanic.role,
					type: 'PART_DELIVERED',
					message: `Деталь \"${partName}\" надійшла на склад (+${deliveredQty}).${ordersSuffix}`,
					metadata: {
						partId,
						partName,
						deliveredQty,
						orderNumbers,
					},
				}),
			),
		);
	}
}
