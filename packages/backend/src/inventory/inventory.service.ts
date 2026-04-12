import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from 'prisma/generated/prisma/client';
import { AuthUser } from 'src/auth/types/auth-user.type';
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

	private assertOrganizationId(user: AuthUser): string {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return user.organizationId;
	}

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
		actor: AuthUser,
	) {
		const organizationId = this.assertOrganizationId(actor);
		const {
			category,
			brand,
			manufacturer,
			supplier,
			inventory,
			priceRules,
			...rest
		} = data;

		const initialQty = (inventory || []).reduce(
			(sum, entry) => sum + Number(entry.quantity || 0),
			0,
		);

		return this.db.part.create({
			data: {
				...rest,
				organization: {
					connect: {
						id: organizationId,
					},
				},
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
		actor: AuthUser,
	) {
		const organizationId = this.assertOrganizationId(actor);
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
			throw new BadRequestException('Part ID is required for update');
		}

		const inventoryInput = inventory?.[0];
		const desiredTotalQty =
			inventoryInput?.quantity !== undefined
				? Number(inventoryInput.quantity)
				: undefined;

		if (desiredTotalQty !== undefined && desiredTotalQty < 0) {
			throw new BadRequestException('Inventory quantity cannot be negative');
		}

		const { updatedPart, qtyDifference } = await this.db.$transaction(
			async tx => {
				const currentPart = await tx.part.findFirst({
					where: {
						id,
						organizationId,
					},
					include: { inventory: true },
				});

				if (!currentPart) {
					throw new NotFoundException('Part not found');
				}

				const oldQty = currentPart.inventory.reduce(
					(sum, item) => sum + item.quantity,
					0,
				);
				const newQty = desiredTotalQty ?? oldQty;
				const qtyDifference = newQty - oldQty;

				if (qtyDifference > 0) {
					await this.addStockToLatestBatch(
						tx,
						id,
						qtyDifference,
						inventoryInput,
					);
				} else if (qtyDifference < 0) {
					await this.consumeStockFromBatches(tx, id, Math.abs(qtyDifference));
				}

				if (
					inventoryInput &&
					desiredTotalQty === undefined &&
					(inventoryInput.location !== undefined ||
						inventoryInput.purchasePrice !== undefined)
				) {
					await this.updateLatestBatchMetadata(tx, id, inventoryInput);
				}

				const updatedPart = await tx.part.update({
					where: { id },
					data: {
						...rest,
						...(category?.id && {
							category: { connect: { id: category.id } },
						}),
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

				if (qtyDifference !== 0) {
					await tx.stockMovement.create({
						data: {
							partId: id,
							type: 'ADJUSTMENT',
							quantity: qtyDifference,
							reason: 'Manual stock adjustment via edit form',
						},
					});
				}

				return { updatedPart, qtyDifference };
			},
		);

		if (qtyDifference > 0) {
			await this.notifyMechanicsAboutPartDelivery(
				id,
				updatedPart.name,
				qtyDifference,
				organizationId,
			);
		}

		return updatedPart;
	}

	async getAll(input: GetInventoryDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		const { skip, perPage } = this.paginationService.getPagination({
			page: input.page,
			perPage: input.perPage,
		});

		const filter = this.filterService.createFilter(
			input.filters,
			input.joinOperator,
			false,
		);
		const scopedFilter = {
			AND: [
				filter,
				{
					organizationId,
				},
			],
		};

		const sortFilter = this.filterService.getSortFilter(input.sort);

		const [parts, total] = await Promise.all([
			this.db.part.findMany({
				where: scopedFilter,
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
			this.db.part.count({ where: scopedFilter }),
		]);

		return {
			data: parts,
			total,
			pageCount: this.paginationService.getPageCount(total, perPage),
		};
	}

	async getStatistics(actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		const parts = await this.db.part.findMany({
			where: {
				organizationId,
			},
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
							deletedAt: null,
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
	async getPartMovementHistory(partId: string, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);

		const part = await this.db.part.findFirst({
			where: {
				id: partId,
				organizationId,
			},
			select: { id: true },
		});

		if (!part) {
			throw new NotFoundException('Part not found');
		}

		const movements = await this.db.stockMovement.findMany({
			where: {
				partId,
				part: {
					organizationId,
				},
			},
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
			adjustment: 0,
		};

		movements.forEach(m => {
			if (m.type === 'RECEIVED') stats.received += m.quantity;
			if (m.type === 'ISSUED') stats.issued += Math.abs(m.quantity);
			if (m.type === 'RESERVED') stats.reserved += Math.abs(m.quantity);
			if (m.type === 'RETURNED') stats.returned += Math.abs(m.quantity);
			if (m.type === 'ADJUSTMENT') stats.adjustment += m.quantity;
		});

		return {
			stats,
			history: movements,
		};
	}
	async deleteBulk(ids: string[], actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		if (!ids?.length) {
			throw new BadRequestException('ids are required for bulk delete');
		}

		const partsWithMovements = await this.db.stockMovement.groupBy({
			by: ['partId'],
			where: {
				partId: { in: ids },
				part: {
					organizationId,
				},
			},
		});

		if (partsWithMovements.length) {
			throw new BadRequestException(
				'Cannot delete parts with stock movement history. Remove them from catalog manually or archive them instead.',
			);
		}

		await this.db.$transaction(async tx => {
			await tx.partInventory.deleteMany({
				where: {
					partId: { in: ids },
					part: {
						organizationId,
					},
				},
			});
			await tx.partPriceRule.deleteMany({
				where: {
					partId: { in: ids },
					part: {
						organizationId,
					},
				},
			});
			await tx.part.deleteMany({
				where: {
					id: { in: ids },
					organizationId,
				},
			});
		});
	}

	private async consumeStockFromBatches(
		tx: Prisma.TransactionClient,
		partId: string,
		quantity: number,
	) {
		let remaining = quantity;

		const batches = await tx.partInventory.findMany({
			where: { partId },
			orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
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

			await tx.partInventory.update({
				where: { id: batch.id },
				data: {
					quantity: { decrement: toConsume },
				},
			});

			remaining -= toConsume;
		}

		if (remaining > 0) {
			throw new BadRequestException(
				`Not enough stock to reduce part ${partId} by ${quantity}.`,
			);
		}
	}

	private async addStockToLatestBatch(
		tx: Prisma.TransactionClient,
		partId: string,
		quantity: number,
		inventoryInput?: { location?: string; purchasePrice?: number | string },
	) {
		const latestBatch = await tx.partInventory.findFirst({
			where: { partId },
			orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }],
			select: { id: true },
		});

		if (latestBatch) {
			await tx.partInventory.update({
				where: { id: latestBatch.id },
				data: {
					quantity: { increment: quantity },
					...(inventoryInput?.location !== undefined
						? { location: inventoryInput.location }
						: {}),
					...(inventoryInput?.purchasePrice !== undefined
						? {
								purchasePrice: new Prisma.Decimal(inventoryInput.purchasePrice),
							}
						: {}),
				},
			});
			return;
		}

		await tx.partInventory.create({
			data: {
				partId,
				quantity,
				purchasePrice:
					inventoryInput?.purchasePrice !== undefined
						? new Prisma.Decimal(inventoryInput.purchasePrice)
						: new Prisma.Decimal(0),
				location: inventoryInput?.location || 'MAIN',
			},
		});
	}

	private async updateLatestBatchMetadata(
		tx: Prisma.TransactionClient,
		partId: string,
		inventoryInput: { location?: string; purchasePrice?: number | string },
	) {
		const latestBatch = await tx.partInventory.findFirst({
			where: { partId },
			orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }],
			select: { id: true },
		});

		if (!latestBatch) {
			return;
		}

		await tx.partInventory.update({
			where: { id: latestBatch.id },
			data: {
				...(inventoryInput.location !== undefined
					? { location: inventoryInput.location }
					: {}),
				...(inventoryInput.purchasePrice !== undefined
					? {
							purchasePrice: new Prisma.Decimal(inventoryInput.purchasePrice),
						}
					: {}),
			},
		});
	}

	private async notifyMechanicsAboutPartDelivery(
		partId: string,
		partName: string,
		deliveredQty: number,
		organizationId: string,
	) {
		const relatedOrders = await this.db.order.findMany({
			where: {
				deletedAt: null,
				client: {
					organizationId,
				},
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
				organizationId,
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
