import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import {
	NotificationType,
	OrderStatus,
	Prisma,
	Role,
} from 'prisma/generated/prisma/client';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { FilterService } from 'src/filter/filter.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BulkUpdateOrderDto } from './dto/bulk-update.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/filter.dto';
import { QuickUpdateOrderDto } from './dto/quick-update-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { orderDetailSelect } from './selects/order-detail.select';
import { orderSelect } from './selects/order.select';

@Injectable()
export class OrdersService {
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

	private applyOrganizationScope(
		where: Prisma.OrderWhereInput,
		organizationId: string,
	): Prisma.OrderWhereInput {
		if (!where || Object.keys(where).length === 0) {
			return {
				client: {
					organizationId,
				},
			};
		}

		return {
			AND: [
				where,
				{
					client: {
						organizationId,
					},
				},
			],
		};
	}

	async getRecommendedParts(
		vehicleId: string,
		serviceId: string,
		user: AuthUser,
	) {
		const organizationId = this.assertOrganizationId(user);
		if (!vehicleId || !serviceId) {
			throw new BadRequestException('vehicleId and serviceId are required');
		}

		const service = await this.db.service.findFirst({
			where: {
				id: serviceId,
				organizationId,
			},
			include: { requiredCategories: true },
		});
		if (!service) throw new NotFoundException('Service not found');

		const vehicle = await this.db.vehicle.findFirst({
			where: {
				id: vehicleId,
				organizationId,
			},
			include: { owner: true },
		});
		if (!vehicle) throw new NotFoundException('Vehicle not found');

		let parts: any[] = [];
		if (service.requiredCategories && service.requiredCategories.length > 0) {
			const categoryIds = service.requiredCategories.map(c => c.id);

			const partsWithInventory = await this.db.part.findMany({
				where: {
					organizationId,
					categoryId: { in: categoryIds },
					inventory: {
						some: {
							quantity: { gt: 0 },
						},
					},
				},
				include: {
					inventory: true,
					priceRules: true,
					category: true,
				},
			});

			parts = partsWithInventory.map(part => {
				const totalStock = part.inventory.reduce(
					(sum, inv) => sum + inv.quantity,
					0,
				);

				const avgPurchasePrice =
					part.inventory.reduce(
						(sum, inv) => sum + Number(inv.purchasePrice) * inv.quantity,
						0,
					) / totalStock;

				const applicableRule = part.priceRules.find(
					rule => rule.clientType === null || rule.clientType === 'RETAIL',
				);

				let finalPrice = avgPurchasePrice;

				if (applicableRule) {
					if (applicableRule.fixedPrice) {
						finalPrice = Number(applicableRule.fixedPrice);
					} else if (applicableRule.markupPercent) {
						finalPrice =
							avgPurchasePrice * (1 + applicableRule.markupPercent / 100);
					}
				} else {
					finalPrice = avgPurchasePrice * 1.3;
				}

				return {
					id: part.id,
					name: part.name,
					price: Number(finalPrice.toFixed(2)),
					stock: totalStock,
					category: part.category.name,
				};
			});
		}

		return parts;
	}

	async create(createOrderDto: CreateOrderDto, actor: AuthUser) {
		try {
			const organizationId = this.assertOrganizationId(actor);

			const [client, vehicle] = await Promise.all([
				this.db.client.findFirst({
					where: {
						id: createOrderDto.clientId,
						organizationId,
						deletedAt: null,
					},
					select: { id: true },
				}),
				this.db.vehicle.findFirst({
					where: {
						id: createOrderDto.vehicleId,
						organizationId,
						deletedAt: null,
					},
					select: { id: true },
				}),
			]);

			if (!client) {
				throw new BadRequestException('Client not found in your organization');
			}

			if (!vehicle) {
				throw new BadRequestException('Vehicle not found in your organization');
			}

			const pricing = await this.buildOrderPricing(
				createOrderDto.services,
				createOrderDto.parts,
				organizationId,
			);

			const result = await this.db.$transaction(async tx => {
				const order = await tx.order.create({
					data: {
						status: createOrderDto.status,
						description: createOrderDto.notes || null,
						endDate: createOrderDto.endDate
							? new Date(createOrderDto.endDate)
							: null,
						mileage: createOrderDto.mileage,
						discount: 0,
						recommendations: null,
						totalAmount: pricing.totalAmount,
						priority: createOrderDto.priority,
						vehicle: { connect: { id: createOrderDto.vehicleId } },
						client: { connect: { id: createOrderDto.clientId } },
						manager: { connect: { id: actor.id } },
					},
				});

				if (createOrderDto.services.length > 0) {
					await tx.orderService.createMany({
						data: pricing.orderServicesData.map(item => ({
							...item,
							orderId: order.id,
						})),
					});
				}

				if (createOrderDto.parts.length > 0) {
					await tx.orderPart.createMany({
						data: pricing.orderPartsData.map(item => ({
							...item,
							orderId: order.id,
						})),
					});
				}

				await this.syncDenormalizedStats(
					{
						clientIds: [order.clientId],
						vehicleIds: [order.vehicleId],
					},
					tx,
				);

				await this.syncStockMovementsForOrderTransition(
					{
						orderId: order.id,
						userId: actor.id,
						fromStatus: null,
						toStatus: order.status,
						fromParts: [],
						toParts: createOrderDto.parts,
					},
					tx,
				);

				return order;
			});

			await this.notifyOrderChange({
				orderId: result.id,
				orderNumber: result.orderNumber,
				type: 'ORDER_CREATED',
				baseMessage: `Нове замовлення №${result.orderNumber} створено.`,
				excludedUserId: actor.id,
			});

			return result;
		} catch (error) {
			console.error('Error creating order:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async findAll(input: GetOrdersDto, user: AuthUser) {
		try {
			const organizationId = this.assertOrganizationId(user);
			const { skip: offset, perPage } = this.paginationService.getPagination({
				page: input.page,
				perPage: input.perPage,
			});
			const filters = this.filterService.createFilter(
				input.filters,
				input.joinOperator,
			);
			const orgScopedFilters = this.applyOrganizationScope(
				filters,
				organizationId,
			);
			const scopedFilters = this.applyMechanicScope(orgScopedFilters, user);

			const sorts = this.filterService.getSortFilter(input.sort || []);
			const orderBy = sorts.length ? sorts : [{ orderNumber: 'desc' as const }];
			const [orders, total] = await Promise.all([
				this.db.order.findMany({
					skip: offset,
					where: scopedFilters,
					take: input.perPage,
					orderBy,
					select: orderSelect,
				}),
				this.db.order.count({ where: scopedFilters }),
			]);
			const normalizedOrders = orders.map(order => {
				const serviceMechanics = order.services
					.map(s => s.mechanic)
					.filter((mechanic): mechanic is { id: string; fullName: string } =>
						Boolean(mechanic),
					);

				const uniqueServiceMechanics = Array.from(
					new Map(
						serviceMechanics.map(mechanic => [mechanic.id, mechanic]),
					).values(),
				);

				const resolvedMechanic =
					order.mechanic ??
					(uniqueServiceMechanics.length === 1
						? uniqueServiceMechanics[0]
						: null);

				return {
					...order,
					mechanic: resolvedMechanic,
					services: order.services.map(s => s.service),
				};
			});
			const visibleOrders = this.isMechanic(user)
				? normalizedOrders.map(order => ({ ...order, totalAmount: '0' }))
				: normalizedOrders;
			const pageCount = this.paginationService.getPageCount(total, perPage);
			return {
				data: visibleOrders,
				pageCount,
				total,
			};
		} catch (error) {
			console.error('Error fetching orders:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async findOne(id: string, user: AuthUser) {
		const organizationId = this.assertOrganizationId(user);
		const order = await this.db.order.findFirst({
			where: this.applyMechanicScope(
				this.applyOrganizationScope({ id }, organizationId),
				user,
			),
			select: orderDetailSelect,
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		const assignedTo = order.mechanic ?? order.manager;
		const isMechanic = this.isMechanic(user);
		const services = order.services.map(os => ({
			id: os.id,
			serviceId: os.service.id,
			mechanicId: os.mechanicId,
			name: os.service.name,
			description: os.service.description,
			price: isMechanic ? 0 : Number(os.price),
			laborHours: os.service.estimatedTime ?? 0,
			quantity: os.quantity,
		}));
		const parts = order.parts.map(op => ({
			id: op.id,
			partId: op.part.id,
			name: op.part.name,
			sku: op.part.sku,
			quantity: op.quantity,
			unitPrice: isMechanic ? 0 : Number(op.price),
		}));

		return {
			...order,
			mileage: order.mileage,
			totalAmount:
				isMechanic || !order.totalAmount ? '0' : String(order.totalAmount),
			createdAt: order.startDate,
			dueDate: order.endDate,
			estimatedCompletion: order.endDate,
			notes: order.description,
			vehicle: order.vehicle
				? {
						...order.vehicle,
						make: order.vehicle.brand,
						plate: order.vehicle.plateNumber,
					}
				: null,
			client: order.client
				? {
						...order.client,
						name: order.client.fullName,
						avatar: null,
						address: null,
					}
				: null,
			assignedTo: assignedTo
				? {
						id: assignedTo.id,
						name: assignedTo.fullName,
						avatar: assignedTo.avatar,
						specialty: '—',
					}
				: null,
			services,
			parts,
			media: [],
		};
	}

	async update(id: string, updateOrderDto: UpdateOrderDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		const existingOrder = await this.db.order.findFirst({
			where: {
				id,
				client: {
					organizationId,
				},
			},
			include: {
				services: true,
				parts: true,
			},
		});

		if (!existingOrder) {
			throw new NotFoundException('Order not found');
		}

		if (updateOrderDto.clientId) {
			const client = await this.db.client.findFirst({
				where: {
					id: updateOrderDto.clientId,
					organizationId,
					deletedAt: null,
				},
				select: { id: true },
			});

			if (!client) {
				throw new BadRequestException('Client not found in your organization');
			}
		}

		if (updateOrderDto.vehicleId) {
			const vehicle = await this.db.vehicle.findFirst({
				where: {
					id: updateOrderDto.vehicleId,
					organizationId,
					deletedAt: null,
				},
				select: { id: true },
			});

			if (!vehicle) {
				throw new BadRequestException('Vehicle not found in your organization');
			}
		}

		const nextServices =
			updateOrderDto.services ??
			existingOrder.services.map(service => ({
				serviceId: service.serviceId,
				mechanicId: service.mechanicId ?? undefined,
			}));

		const nextParts =
			updateOrderDto.parts ??
			existingOrder.parts.map(part => ({
				partId: part.partId,
				quantity: part.quantity,
			}));

		const scopedPricing = await this.buildOrderPricing(
			nextServices,
			nextParts,
			organizationId,
		);

		const updatedOrder = await this.db.$transaction(async tx => {
			const updatedOrder = await tx.order.update({
				where: { id },
				data: {
					clientId: updateOrderDto.clientId ?? existingOrder.clientId,
					vehicleId: updateOrderDto.vehicleId ?? existingOrder.vehicleId,
					endDate:
						updateOrderDto.endDate !== undefined
							? updateOrderDto.endDate
								? new Date(updateOrderDto.endDate)
								: null
							: existingOrder.endDate,
					mileage: updateOrderDto.mileage ?? existingOrder.mileage,
					status: updateOrderDto.status ?? existingOrder.status,
					priority: updateOrderDto.priority ?? existingOrder.priority,
					description:
						updateOrderDto.notes !== undefined
							? updateOrderDto.notes || null
							: existingOrder.description,
					totalAmount: scopedPricing.totalAmount,
				},
			});

			if (updateOrderDto.services !== undefined) {
				await tx.orderService.deleteMany({ where: { orderId: id } });
				if (scopedPricing.orderServicesData.length > 0) {
					await tx.orderService.createMany({
						data: scopedPricing.orderServicesData.map(item => ({
							...item,
							orderId: id,
						})),
					});
				}
			}

			if (updateOrderDto.parts !== undefined) {
				await tx.orderPart.deleteMany({ where: { orderId: id } });
				if (scopedPricing.orderPartsData.length > 0) {
					await tx.orderPart.createMany({
						data: scopedPricing.orderPartsData.map(item => ({
							...item,
							orderId: id,
						})),
					});
				}
			}

			await this.syncDenormalizedStats(
				{
					clientIds: [existingOrder.clientId, updatedOrder.clientId],
					vehicleIds: [existingOrder.vehicleId, updatedOrder.vehicleId],
				},
				tx,
			);

			await this.syncStockMovementsForOrderTransition(
				{
					orderId: updatedOrder.id,
					userId: actor.id,
					fromStatus: existingOrder.status,
					toStatus: updatedOrder.status,
					fromParts: existingOrder.parts.map(part => ({
						partId: part.partId,
						quantity: part.quantity,
					})),
					toParts: nextParts,
				},
				tx,
			);

			return updatedOrder;
		});

		await this.notifyOrderChange({
			orderId: updatedOrder.id,
			orderNumber: updatedOrder.orderNumber,
			type: 'ORDER_UPDATED',
			baseMessage: `Замовлення №${updatedOrder.orderNumber} оновлено.`,
			excludedUserId: actor.id,
		});

		return updatedOrder;
	}

	async quickUpdate(id: string, dto: QuickUpdateOrderDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		const existing = await this.db.order.findFirst({
			where: {
				id,
				client: {
					organizationId,
				},
			},
		});
		if (!existing) throw new NotFoundException('Order not found');

		if (dto.mechanicId) {
			const mechanic = await this.db.user.findFirst({
				where: {
					id: dto.mechanicId,
					organizationId,
					role: Role.MECHANIC,
					deletedAt: null,
				},
				select: { id: true },
			});

			if (!mechanic) {
				throw new BadRequestException(
					'Mechanic not found in your organization',
				);
			}
		}

		const updatedOrder = await this.db.order.update({
			where: { id },
			data: {
				...(dto.mechanicId !== undefined
					? {
							mechanic: dto.mechanicId
								? { connect: { id: dto.mechanicId } }
								: { disconnect: true },
						}
					: {}),
				...(dto.endDate !== undefined
					? { endDate: dto.endDate ? new Date(dto.endDate) : null }
					: {}),
			},
			select: {
				id: true,
				orderNumber: true,
				mechanicId: true,
				endDate: true,
				vehicleId: true,
			},
		});

		if (dto.endDate !== undefined) {
			await this.syncDenormalizedStats({
				vehicleIds: [updatedOrder.vehicleId],
			});
		}

		await this.notifyOrderChange({
			orderId: updatedOrder.id,
			orderNumber: updatedOrder.orderNumber,
			type: 'ORDER_UPDATED',
			baseMessage: `Замовлення №${updatedOrder.orderNumber} оновлено.`,
			excludedUserId: actor.id,
		});

		return updatedOrder;
	}

	async updateBulk(data: BulkUpdateOrderDto, user: AuthUser) {
		const organizationId = this.assertOrganizationId(user);
		const { ids, status, priority } = data;
		const isMechanic = this.isMechanic(user);

		const updateData: Record<string, unknown> = {};

		if (status !== undefined) {
			if (
				isMechanic &&
				status !== OrderStatus.IN_PROGRESS &&
				status !== OrderStatus.COMPLETED
			) {
				throw new ForbiddenException(
					'Mechanics can only set IN_PROGRESS or COMPLETED status',
				);
			}
			updateData.status = status;
		}

		if (priority !== undefined) {
			if (isMechanic) {
				throw new ForbiddenException('Mechanics cannot update priority');
			}
			updateData.priority = priority;
		}

		if (Object.keys(updateData).length === 0) {
			throw new BadRequestException('No fields provided for bulk update');
		}

		const where = this.applyMechanicScope(
			this.applyOrganizationScope(
				{
					id: { in: ids },
				},
				organizationId,
			),
			user,
		);

		const { targetOrders, result } = await this.db.$transaction(async tx => {
			const targetOrders = await tx.order.findMany({
				where,
				select: {
					id: true,
					orderNumber: true,
					vehicleId: true,
					status: true,
					parts: {
						select: {
							partId: true,
							quantity: true,
						},
					},
				},
			});

			if (!targetOrders.length) {
				return {
					targetOrders,
					result: { count: 0 },
				};
			}

			const result = await tx.order.updateMany({
				where,
				data: updateData,
			});

			if (status !== undefined) {
				await this.syncDenormalizedStats(
					{
						vehicleIds: targetOrders.map(order => order.vehicleId),
					},
					tx,
				);

				await Promise.all(
					targetOrders.map(order =>
						this.syncStockMovementsForOrderTransition(
							{
								orderId: order.id,
								userId: user.id,
								fromStatus: order.status,
								toStatus: status as OrderStatus,
								fromParts: order.parts.map(part => ({
									partId: part.partId,
									quantity: part.quantity,
								})),
								toParts: order.parts.map(part => ({
									partId: part.partId,
									quantity: part.quantity,
								})),
							},
							tx,
						),
					),
				);
			}

			return { targetOrders, result };
		});

		if (!targetOrders.length) {
			return result;
		}

		if (status === OrderStatus.COMPLETED && isMechanic) {
			await Promise.all(
				targetOrders.map(order =>
					this.notifyManagersOnly({
						organizationId,
						type: 'ORDER_COMPLETED',
						message: `✅ Роботу виконано: Механік ${user.fullName} завершив ремонт №${order.orderNumber}`,
						metadata: { orderId: order.id, orderNumber: order.orderNumber },
						excludedUserId: user.id,
					}),
				),
			);
		} else {
			await Promise.all(
				targetOrders.map(order =>
					this.notifyOrderChange({
						orderId: order.id,
						orderNumber: order.orderNumber,
						type: 'ORDER_UPDATED',
						baseMessage: `Замовлення №${order.orderNumber} оновлено.`,
						excludedUserId: user.id,
					}),
				),
			);
		}

		return result;
	}

	private async notifyOrderChange(input: {
		orderId: string;
		orderNumber: number;
		type: NotificationType;
		baseMessage: string;
		excludedUserId?: string;
	}) {
		const recipients = await this.getOrderRecipients(
			input.orderId,
			input.excludedUserId,
		);

		if (!recipients.length) {
			return;
		}

		await Promise.all(
			recipients.map(recipient =>
				this.notificationsService.notify({
					userId: recipient.id,
					role: recipient.role,
					type: input.type,
					message: input.baseMessage,
					metadata: {
						orderId: input.orderId,
						orderNumber: input.orderNumber,
					},
				}),
			),
		);
	}

	private async recalculateClientStats(
		clientId: string,
		tx?: Prisma.TransactionClient,
	) {
		const dbClient = tx ?? this.db;

		const [vehicles, orders, latestOrder] = await Promise.all([
			dbClient.vehicle.count({
				where: { ownerId: clientId, deletedAt: null },
			}),
			dbClient.order.aggregate({
				where: { clientId, deletedAt: null },
				_count: true,
				_sum: { totalAmount: true },
			}),
			dbClient.order.findFirst({
				where: { clientId, deletedAt: null },
				orderBy: { startDate: 'desc' },
				select: { startDate: true },
			}),
		]);

		await dbClient.client.update({
			where: { id: clientId },
			data: {
				vehicleCount: vehicles,
				totalOrders: orders._count,
				totalSpent: orders._sum.totalAmount || 0,
				latestVisit: latestOrder?.startDate || null,
			},
		});
	}

	private async recalculateVehicleStats(
		vehicleId: string,
		tx?: Prisma.TransactionClient,
	) {
		const dbClient = tx ?? this.db;

		const [totalServices, latestCompletedOrder] = await Promise.all([
			dbClient.order.count({
				where: {
					vehicleId,
					deletedAt: null,
					status: OrderStatus.COMPLETED,
				},
			}),
			dbClient.order.findFirst({
				where: {
					vehicleId,
					deletedAt: null,
					status: OrderStatus.COMPLETED,
					endDate: { not: null },
				},
				orderBy: { endDate: 'desc' },
				select: { endDate: true },
			}),
		]);

		await dbClient.vehicle.update({
			where: { id: vehicleId },
			data: {
				totalServices,
				lastService: latestCompletedOrder?.endDate || null,
			},
		});
	}

	private async syncDenormalizedStats(
		input: {
			clientIds?: string[];
			vehicleIds?: string[];
		},
		tx?: Prisma.TransactionClient,
	) {
		const clientIds = [...new Set((input.clientIds || []).filter(Boolean))];
		const vehicleIds = [...new Set((input.vehicleIds || []).filter(Boolean))];

		await Promise.all([
			...clientIds.map(clientId => this.recalculateClientStats(clientId, tx)),
			...vehicleIds.map(vehicleId =>
				this.recalculateVehicleStats(vehicleId, tx),
			),
		]);
	}

	private getOrderStockState(
		status: OrderStatus | null,
	): 'reserved' | 'issued' | 'none' {
		if (!status) {
			return 'none';
		}

		if (
			status === OrderStatus.NEW ||
			status === OrderStatus.IN_PROGRESS ||
			status === OrderStatus.WAITING_PARTS
		) {
			return 'reserved';
		}

		if (status === OrderStatus.COMPLETED || status === OrderStatus.PAID) {
			return 'issued';
		}

		return 'none';
	}

	private toPartQuantityMap(
		parts: Array<{ partId: string; quantity: number }>,
	): Map<string, number> {
		const map = new Map<string, number>();
		for (const part of parts) {
			const qty = Number(part.quantity || 0);
			if (qty <= 0) {
				continue;
			}

			map.set(part.partId, (map.get(part.partId) || 0) + qty);
		}

		return map;
	}

	private pushMovementEventsFromMap(input: {
		events: Prisma.StockMovementCreateManyInput[];
		orderId: string;
		userId?: string;
		map: Map<string, number>;
		type: 'RESERVED' | 'ISSUED' | 'RETURNED';
		reason: string;
	}) {
		for (const [partId, quantity] of input.map.entries()) {
			if (quantity <= 0) {
				continue;
			}

			input.events.push({
				partId,
				orderId: input.orderId,
				userId: input.userId || null,
				type: input.type,
				quantity,
				reason: input.reason,
			});
		}
	}

	private createDeltaMovementEvents(input: {
		orderId: string;
		userId?: string;
		fromStatus: OrderStatus | null;
		toStatus: OrderStatus | null;
		fromParts: Array<{ partId: string; quantity: number }>;
		toParts: Array<{ partId: string; quantity: number }>;
	}): Prisma.StockMovementCreateManyInput[] {
		const fromState = this.getOrderStockState(input.fromStatus);
		const toState = this.getOrderStockState(input.toStatus);

		const fromMap = this.toPartQuantityMap(input.fromParts);
		const toMap = this.toPartQuantityMap(input.toParts);
		const events: Prisma.StockMovementCreateManyInput[] = [];
		const transition = `${input.fromStatus ?? 'NONE'} -> ${input.toStatus ?? 'NONE'}`;

		if (fromState === toState) {
			if (fromState === 'none') {
				return events;
			}

			const type = fromState === 'reserved' ? 'RESERVED' : 'ISSUED';
			const allPartIds = new Set([...fromMap.keys(), ...toMap.keys()]);

			for (const partId of allPartIds) {
				const oldQty = fromMap.get(partId) || 0;
				const newQty = toMap.get(partId) || 0;

				if (newQty > oldQty) {
					events.push({
						partId,
						orderId: input.orderId,
						userId: input.userId || null,
						type,
						quantity: newQty - oldQty,
						reason: `Order stock delta (${transition})`,
					});
				} else if (oldQty > newQty) {
					events.push({
						partId,
						orderId: input.orderId,
						userId: input.userId || null,
						type: 'RETURNED',
						quantity: oldQty - newQty,
						reason: `Order stock delta (${transition})`,
					});
				}
			}

			return events;
		}

		if (fromState === 'none' && toState === 'reserved') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: toMap,
				type: 'RESERVED',
				reason: `Order became active (${transition})`,
			});
			return events;
		}

		if (fromState === 'none' && toState === 'issued') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: toMap,
				type: 'ISSUED',
				reason: `Order completed from non-stock state (${transition})`,
			});
			return events;
		}

		if (fromState === 'reserved' && toState === 'none') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: fromMap,
				type: 'RETURNED',
				reason: `Order left active state (${transition})`,
			});
			return events;
		}

		if (fromState === 'issued' && toState === 'none') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: fromMap,
				type: 'RETURNED',
				reason: `Order reopened/cancelled after issue (${transition})`,
			});
			return events;
		}

		if (fromState === 'reserved' && toState === 'issued') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: toMap,
				type: 'ISSUED',
				reason: `Order completed (${transition})`,
			});

			for (const [partId, oldQty] of fromMap.entries()) {
				const newQty = toMap.get(partId) || 0;
				if (oldQty > newQty) {
					events.push({
						partId,
						orderId: input.orderId,
						userId: input.userId || null,
						type: 'RETURNED',
						quantity: oldQty - newQty,
						reason: `Unused reserved quantity returned (${transition})`,
					});
				}
			}

			return events;
		}

		if (fromState === 'issued' && toState === 'reserved') {
			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: fromMap,
				type: 'RETURNED',
				reason: `Order moved back to active state (${transition})`,
			});

			this.pushMovementEventsFromMap({
				events,
				orderId: input.orderId,
				userId: input.userId,
				map: toMap,
				type: 'RESERVED',
				reason: `Order moved back to active state (${transition})`,
			});
		}

		return events;
	}

	private async validateStockAvailabilityForTransition(
		input: {
			orderId: string;
			fromStatus: OrderStatus | null;
			toStatus: OrderStatus | null;
			fromParts: Array<{ partId: string; quantity: number }>;
			toParts: Array<{ partId: string; quantity: number }>;
		},
		tx?: Prisma.TransactionClient,
	) {
		const dbClient = tx ?? this.db;
		const partIds = [
			...new Set([...input.fromParts, ...input.toParts].map(p => p.partId)),
		];

		if (!partIds.length) {
			return;
		}

		const fromState = this.getOrderStockState(input.fromStatus);
		const toState = this.getOrderStockState(input.toStatus);

		const fromMap = this.toPartQuantityMap(input.fromParts);
		const toMap = this.toPartQuantityMap(input.toParts);

		const fromAllocatedMap =
			fromState === 'none' ? new Map<string, number>() : fromMap;
		const toAllocatedMap =
			toState === 'none' ? new Map<string, number>() : toMap;

		const [onHandRows, reservedRows] = await Promise.all([
			dbClient.partInventory.groupBy({
				by: ['partId'],
				where: { partId: { in: partIds } },
				_sum: { quantity: true },
			}),
			dbClient.orderPart.groupBy({
				by: ['partId'],
				where: {
					partId: { in: partIds },
					order: {
						deletedAt: null,
						status: {
							in: [
								OrderStatus.NEW,
								OrderStatus.IN_PROGRESS,
								OrderStatus.WAITING_PARTS,
							],
						},
						id: { not: input.orderId },
					},
				},
				_sum: { quantity: true },
			}),
		]);

		const onHandMap = new Map<string, number>();
		for (const row of onHandRows) {
			onHandMap.set(row.partId, row._sum.quantity || 0);
		}

		const reservedMap = new Map<string, number>();
		for (const row of reservedRows) {
			reservedMap.set(row.partId, row._sum.quantity || 0);
		}

		for (const partId of partIds) {
			const currentOnHand = onHandMap.get(partId) || 0;
			const reservedByOtherOrders = reservedMap.get(partId) || 0;
			const availableForAllocation = currentOnHand - reservedByOtherOrders;

			const fromAllocated = fromAllocatedMap.get(partId) || 0;
			const toAllocated = toAllocatedMap.get(partId) || 0;
			const additionalAllocation = Math.max(toAllocated - fromAllocated, 0);

			if (additionalAllocation > availableForAllocation) {
				throw new BadRequestException(
					`Not enough stock for part ${partId}: required additional ${additionalAllocation}, available ${Math.max(availableForAllocation, 0)}.`,
				);
			}
		}
	}

	private async consumePartInventory(
		partId: string,
		quantity: number,
		tx: Prisma.TransactionClient,
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
				data: { quantity: { decrement: toConsume } },
			});

			remaining -= toConsume;
		}

		if (remaining > 0) {
			throw new BadRequestException(
				`Not enough stock for part ${partId}: missing ${remaining} item(s).`,
			);
		}
	}

	private async returnPartInventory(
		partId: string,
		quantity: number,
		tx: Prisma.TransactionClient,
	) {
		const latestBatch = await tx.partInventory.findFirst({
			where: { partId },
			orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }],
			select: {
				id: true,
				purchasePrice: true,
				location: true,
			},
		});

		if (latestBatch) {
			await tx.partInventory.update({
				where: { id: latestBatch.id },
				data: { quantity: { increment: quantity } },
			});
			return;
		}

		await tx.partInventory.create({
			data: {
				partId,
				quantity,
				purchasePrice: new Prisma.Decimal(0),
				location: 'AUTO_RETURN',
			},
		});
	}

	private async applyInventoryDeltaForIssuedTransition(
		input: {
			fromStatus: OrderStatus | null;
			toStatus: OrderStatus | null;
			fromParts: Array<{ partId: string; quantity: number }>;
			toParts: Array<{ partId: string; quantity: number }>;
		},
		tx: Prisma.TransactionClient,
	) {
		const fromState = this.getOrderStockState(input.fromStatus);
		const toState = this.getOrderStockState(input.toStatus);

		const fromIssuedMap =
			fromState === 'issued'
				? this.toPartQuantityMap(input.fromParts)
				: new Map<string, number>();
		const toIssuedMap =
			toState === 'issued'
				? this.toPartQuantityMap(input.toParts)
				: new Map<string, number>();

		const partIds = [
			...new Set([...fromIssuedMap.keys(), ...toIssuedMap.keys()]),
		];

		for (const partId of partIds) {
			const fromIssuedQty = fromIssuedMap.get(partId) || 0;
			const toIssuedQty = toIssuedMap.get(partId) || 0;
			const delta = toIssuedQty - fromIssuedQty;

			if (delta > 0) {
				await this.consumePartInventory(partId, delta, tx);
				continue;
			}

			if (delta < 0) {
				await this.returnPartInventory(partId, Math.abs(delta), tx);
			}
		}
	}

	private async syncStockMovementsForOrderTransition(
		input: {
			orderId: string;
			userId?: string;
			fromStatus: OrderStatus | null;
			toStatus: OrderStatus | null;
			fromParts: Array<{ partId: string; quantity: number }>;
			toParts: Array<{ partId: string; quantity: number }>;
		},
		tx?: Prisma.TransactionClient,
	) {
		if (tx) {
			await this.validateStockAvailabilityForTransition(input, tx);
			await this.applyInventoryDeltaForIssuedTransition(input, tx);

			const events = this.createDeltaMovementEvents(input);
			if (!events.length) {
				return;
			}

			await tx.stockMovement.createMany({
				data: events,
			});
			return;
		}

		await this.db.$transaction(async transaction => {
			await this.validateStockAvailabilityForTransition(input, transaction);
			await this.applyInventoryDeltaForIssuedTransition(input, transaction);

			const events = this.createDeltaMovementEvents(input);
			if (!events.length) {
				return;
			}

			await transaction.stockMovement.createMany({
				data: events,
			});
		});
	}

	private async notifyManagersOnly(input: {
		organizationId: string;
		type: NotificationType;
		message: string;
		metadata?: Prisma.InputJsonValue;
		excludedUserId?: string;
	}) {
		const managers = await this.db.user.findMany({
			where: {
				organizationId: input.organizationId,
				role: Role.MANAGER,
				deletedAt: null,
				...(input.excludedUserId ? { id: { not: input.excludedUserId } } : {}),
			},
			select: { id: true, role: true },
		});

		await Promise.all(
			managers.map(manager =>
				this.notificationsService.notify({
					userId: manager.id,
					role: manager.role,
					type: input.type,
					message: input.message,
					metadata: input.metadata,
				}),
			),
		);
	}

	private async getOrderRecipients(orderId: string, excludedUserId?: string) {
		const order = await this.db.order.findUnique({
			where: { id: orderId },
			select: {
				client: {
					select: {
						organizationId: true,
					},
				},
				mechanicId: true,
				services: {
					select: {
						mechanicId: true,
					},
				},
			},
		});

		if (!order) {
			return [];
		}

		const organizationId = order.client.organizationId;
		if (!organizationId) {
			return [];
		}

		const scopedManagers = await this.db.user.findMany({
			where: {
				organizationId,
				role: Role.MANAGER,
				deletedAt: null,
				...(excludedUserId ? { id: { not: excludedUserId } } : {}),
			},
			select: { id: true, role: true },
		});

		const mechanicIds = new Set<string>();
		if (order.mechanicId) {
			mechanicIds.add(order.mechanicId);
		}

		for (const service of order.services) {
			if (service.mechanicId) {
				mechanicIds.add(service.mechanicId);
			}
		}

		const mechanics = mechanicIds.size
			? await this.db.user.findMany({
					where: {
						organizationId,
						id: { in: [...mechanicIds] },
						role: Role.MECHANIC,
						deletedAt: null,
						...(excludedUserId ? { id: { not: excludedUserId } } : {}),
					},
					select: { id: true, role: true },
				})
			: [];

		const users = [...scopedManagers, ...mechanics];
		const deduped = new Map<string, { id: string; role: Role }>();
		for (const user of users) {
			deduped.set(user.id, user);
		}

		return [...deduped.values()];
	}

	private isMechanic(user: AuthUser): boolean {
		return user.role === Role.MECHANIC;
	}

	private mechanicScope(user: AuthUser): Prisma.OrderWhereInput {
		return {
			OR: [
				{ mechanicId: user.id },
				{ services: { some: { mechanicId: user.id } } },
			],
		};
	}

	private applyMechanicScope(
		where: Prisma.OrderWhereInput,
		user: AuthUser,
	): Prisma.OrderWhereInput {
		if (!this.isMechanic(user)) {
			return where;
		}

		if (!where || Object.keys(where).length === 0) {
			return this.mechanicScope(user);
		}

		return {
			AND: [where, this.mechanicScope(user)],
		};
	}

	async delete(id: string, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		return this.db.$transaction(async tx => {
			const existingOrder = await tx.order.findFirst({
				where: {
					id,
					client: {
						organizationId,
					},
				},
				select: {
					id: true,
					clientId: true,
					vehicleId: true,
					status: true,
					parts: {
						select: {
							partId: true,
							quantity: true,
						},
					},
				},
			});

			if (!existingOrder) {
				throw new NotFoundException('Order not found');
			}

			const deletedOrder = await tx.order.update({
				where: { id: existingOrder.id },
				data: { deletedAt: new Date() },
			});

			await this.syncStockMovementsForOrderTransition(
				{
					orderId: deletedOrder.id,
					userId: actor.id,
					fromStatus: existingOrder.status,
					toStatus: null,
					fromParts: existingOrder.parts.map(part => ({
						partId: part.partId,
						quantity: part.quantity,
					})),
					toParts: [],
				},
				tx,
			);

			await this.syncDenormalizedStats(
				{
					clientIds: [deletedOrder.clientId],
					vehicleIds: [deletedOrder.vehicleId],
				},
				tx,
			);

			return deletedOrder;
		});
	}

	async deleteBulk(ids: string[], actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		if (!ids?.length) {
			throw new BadRequestException('ids are required for bulk delete');
		}

		return this.db.$transaction(async tx => {
			const affectedOrders = await tx.order.findMany({
				where: {
					id: { in: ids },
					deletedAt: null,
					client: {
						organizationId,
					},
				},
				select: {
					id: true,
					clientId: true,
					vehicleId: true,
					status: true,
					parts: {
						select: {
							partId: true,
							quantity: true,
						},
					},
				},
			});

			const result = await tx.order.updateMany({
				where: {
					id: { in: ids },
					client: {
						organizationId,
					},
				},
				data: { deletedAt: new Date() },
			});

			await Promise.all(
				affectedOrders.map(order =>
					this.syncStockMovementsForOrderTransition(
						{
							orderId: order.id,
							userId: actor.id,
							fromStatus: order.status,
							toStatus: null,
							fromParts: order.parts.map(part => ({
								partId: part.partId,
								quantity: part.quantity,
							})),
							toParts: [],
						},
						tx,
					),
				),
			);

			await this.syncDenormalizedStats(
				{
					clientIds: affectedOrders.map(order => order.clientId),
					vehicleIds: affectedOrders.map(order => order.vehicleId),
				},
				tx,
			);

			return result;
		});
	}

	async getNewOrderMeta(user: AuthUser) {
		try {
			const organizationId = this.assertOrganizationId(user);
			const organizationFilter = { organizationId };

			const [clients, vehicles, services, mechanics, parts] = await Promise.all(
				[
					this.db.client.findMany({
						where: {
							...organizationFilter,
							deletedAt: null,
						},
						select: {
							id: true,
							fullName: true,
							email: true,
							phone: true,
						},
					}),
					this.db.vehicle.findMany({
						where: {
							...organizationFilter,
							deletedAt: null,
						},
						select: {
							id: true,
							ownerId: true,
							brand: true,
							model: true,
							year: true,
							plateNumber: true,
						},
					}),
					this.db.service.findMany({
						where: { status: true, ...organizationFilter },
						select: {
							id: true,
							name: true,
							price: true,
							estimatedTime: true,
							requiredCategories: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					}),
					this.db.user.findMany({
						where: {
							role: 'MECHANIC',
							deletedAt: null,
							...organizationFilter,
						},
						select: {
							id: true,
							fullName: true,
						},
					}),
					this.db.part.findMany({
						where: {
							...organizationFilter,
							inventory: {
								some: {
									quantity: { gt: 0 },
								},
							},
						},
						include: {
							inventory: true,
							priceRules: true,
							category: true,
						},
					}),
				],
			);

			const vehicleMileages = await this.db.order.groupBy({
				by: ['vehicleId'],
				where: {
					client: {
						organizationId,
					},
				},
				_max: {
					mileage: true,
				},
			});

			const mileageMap = new Map(
				vehicleMileages.map(vm => [vm.vehicleId, vm._max.mileage || 0]),
			);

			const openStatuses = [
				OrderStatus.NEW,
				OrderStatus.IN_PROGRESS,
				OrderStatus.WAITING_PARTS,
			] as const;

			const mechanicOpenTasks = new Map<string, number>();
			await Promise.all(
				mechanics.map(async mechanic => {
					const openTasksCount = await this.db.order.count({
						where: {
							client: {
								organizationId,
							},
							deletedAt: null,
							status: { in: [...openStatuses] },
							OR: [
								{ mechanicId: mechanic.id },
								{ services: { some: { mechanicId: mechanic.id } } },
							],
						},
					});

					mechanicOpenTasks.set(mechanic.id, openTasksCount);
				}),
			);

			return {
				clients: clients.map(client => ({
					id: client.id,
					name: client.fullName,
					email: client.email ?? '',
					phone: client.phone,
				})),
				vehicles: vehicles.map(vehicle => ({
					id: vehicle.id,
					clientId: vehicle.ownerId,
					make: vehicle.brand,
					model: vehicle.model,
					year: vehicle.year,
					licensePlate: vehicle.plateNumber ?? '',
					lastMileage: mileageMap.get(vehicle.id) || 0,
				})),
				services: services.map(service => ({
					id: service.id,
					name: service.name,
					price: Number(service.price),
					duration: service.estimatedTime,
					requiredCategories: service.requiredCategories || [],
				})),
				mechanics: mechanics.map(mechanic => ({
					id: mechanic.id,
					name: mechanic.fullName,
					specialty: '',
					openTasksCount: mechanicOpenTasks.get(mechanic.id) ?? 0,
				})),
				parts: parts.map(part => {
					const totalStock = part.inventory.reduce(
						(sum, inv) => sum + inv.quantity,
						0,
					);
					const avgPurchasePrice =
						part.inventory.reduce(
							(sum, inv) => sum + Number(inv.purchasePrice) * inv.quantity,
							0,
						) / totalStock;

					const retailRule = part.priceRules.find(
						rule => rule.clientType === null || rule.clientType === 'RETAIL',
					);

					let finalPrice = avgPurchasePrice;
					if (retailRule) {
						if (retailRule.fixedPrice) {
							finalPrice = Number(retailRule.fixedPrice);
						} else if (retailRule.markupPercent) {
							finalPrice =
								avgPurchasePrice * (1 + retailRule.markupPercent / 100);
						}
					} else {
						finalPrice = avgPurchasePrice * 1.3;
					}

					return {
						id: part.id,
						name: part.name,
						price: Number(finalPrice.toFixed(2)),
						stock: totalStock,
						category: part.category.name,
					};
				}),
			};
		} catch (error) {
			console.error('Error fetching new order meta:', error);
			throw new InternalServerErrorException(error);
		}
	}

	private calculatePartPrice(partData: any) {
		const totalStock = partData.inventory.reduce(
			(sum, inv) => sum + inv.quantity,
			0,
		);

		if (totalStock <= 0) {
			return 0;
		}

		const avgPurchasePrice =
			partData.inventory.reduce(
				(sum, inv) => sum + Number(inv.purchasePrice) * inv.quantity,
				0,
			) / totalStock;

		const retailRule = partData.priceRules.find(
			rule => rule.clientType === null || rule.clientType === 'RETAIL',
		);

		if (retailRule?.fixedPrice) {
			return Number(retailRule.fixedPrice);
		}

		if (retailRule?.markupPercent) {
			return avgPurchasePrice * (1 + retailRule.markupPercent / 100);
		}

		return avgPurchasePrice * 1.3;
	}

	private async buildOrderPricing(
		servicesInput: any[],
		partsInput: any[],
		organizationId: string,
	) {
		const serviceIds = servicesInput.map(service => service.serviceId);
		const partIds = partsInput.map(part => part.partId);

		const [services, partsData] = await Promise.all([
			this.db.service.findMany({
				where: {
					id: { in: serviceIds },
					organizationId,
				},
			}),
			this.db.part.findMany({
				where: {
					id: { in: partIds },
					organizationId,
				},
				include: {
					inventory: true,
					priceRules: true,
				},
			}),
		]);

		const servicesTotal = services.reduce(
			(sum, service) => sum + Number(service.price),
			0,
		);

		const orderServicesData = servicesInput.map(serviceItem => {
			const serviceData = services.find(
				service => service.id === serviceItem.serviceId,
			);
			const estimatedHours = Number(
				serviceItem.estimatedHours ?? serviceData?.estimatedTime ?? 1,
			);
			const additionalHours = Number(serviceItem.additionalHours ?? 0);
			return {
				serviceId: serviceItem.serviceId,
				mechanicId: serviceItem.mechanicId || null,
				estimatedHours,
				additionalHours,
				deadline: serviceItem.deadline ? new Date(serviceItem.deadline) : null,
				quantity: 1,
				price: serviceData ? serviceData.price : 0,
			};
		});

		let partsTotal = 0;
		const orderPartsData = partsInput.map(partItem => {
			const partData = partsData.find(part => part.id === partItem.partId);
			const finalPrice = partData ? this.calculatePartPrice(partData) : 0;
			partsTotal += finalPrice * partItem.quantity;

			return {
				partId: partItem.partId,
				quantity: partItem.quantity,
				price: finalPrice,
			};
		});

		return {
			totalAmount: servicesTotal + partsTotal,
			orderServicesData,
			orderPartsData,
		};
	}
}
