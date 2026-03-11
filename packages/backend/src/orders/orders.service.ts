import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BulkUpdateOrderDto } from './dto/bulk-update.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/filter.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { orderDetailSelect } from './selects/order-detail.select';
import { orderSelect } from './selects/order.select';

@Injectable()
export class OrdersService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
	) {}

	async getRecommendedParts(vehicleId: string, serviceId: string) {
		if (!vehicleId || !serviceId) {
			throw new BadRequestException('vehicleId and serviceId are required');
		}

		// Find service with required categories
		const service = await this.db.service.findUnique({
			where: { id: serviceId },
			include: { requiredCategories: true },
		});
		if (!service) throw new NotFoundException('Service not found');

		// Get client info to determine pricing rules
		const vehicle = await this.db.vehicle.findUnique({
			where: { id: vehicleId },
			include: { owner: true },
		});
		if (!vehicle) throw new NotFoundException('Vehicle not found');

		let parts: any[] = [];
		if (service.requiredCategories && service.requiredCategories.length > 0) {
			const categoryIds = service.requiredCategories.map(c => c.id);

			// Find parts with inventory and price rules
			const partsWithInventory = await this.db.part.findMany({
				where: {
					categoryId: { in: categoryIds },
					inventory: {
						some: {
							quantity: { gt: 0 }, // Only parts in stock
						},
					},
				},
				include: {
					inventory: true,
					priceRules: true,
					category: true,
				},
			});

			// Calculate proper prices considering client rules
			parts = partsWithInventory.map(part => {
				// Calculate total stock from all inventory entries
				const totalStock = part.inventory.reduce(
					(sum, inv) => sum + inv.quantity,
					0,
				);

				// Get average purchase price
				const avgPurchasePrice =
					part.inventory.reduce(
						(sum, inv) => sum + Number(inv.purchasePrice) * inv.quantity,
						0,
					) / totalStock;

				// Find applicable price rule (default to RETAIL if no specific rule)
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
					// Default markup if no rule found (e.g., 30%)
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

	async create(createOrderDto: CreateOrderDto) {
		try {
			const pricing = await this.buildOrderPricing(
				createOrderDto.services,
				createOrderDto.parts,
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

				return order;
			});

			return result;
		} catch (error) {
			console.error('Error creating order:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async findAll(input: GetOrdersDto) {
		try {
			const { skip: offset, perPage } = this.paginationService.getPagination({
				page: input.page,
				perPage: input.perPage,
			});
			const filters = this.filterService.createFilter(
				input.filters,
				input.joinOperator,
			);

			const sorts = this.filterService.getSortFilter(input.sort || []);
			const [orders, total] = await Promise.all([
				this.db.order.findMany({
					skip: offset,
					where: filters,
					take: input.perPage,
					orderBy: sorts,
					select: orderSelect,
				}),
				this.db.order.count({ where: filters }),
			]);
			const normalizedOrders = orders.map(order => ({
				...order,
				services: order.services.map(s => s.service),
			}));
			const pageCount = this.paginationService.getPageCount(total, perPage);
			return {
				data: normalizedOrders,
				pageCount,
				total,
			};
		} catch (error) {
			console.error('Error fetching orders:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async findOne(id: string) {
		const order = await this.db.order.findUnique({
			where: { id },
			select: orderDetailSelect,
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		// Normalize response for frontend
		const assignedTo = order.mechanic ?? order.manager;
		const services = order.services.map(os => ({
			id: os.id,
			serviceId: os.service.id,
			mechanicId: os.mechanicId,
			name: os.service.name,
			description: os.service.description,
			price: Number(os.price),
			laborHours: os.service.estimatedTime ?? 0,
			quantity: os.quantity,
		}));
		const parts = order.parts.map(op => ({
			id: op.id,
			partId: op.part.id,
			name: op.part.name,
			sku: op.part.sku,
			quantity: op.quantity,
			unitPrice: Number(op.price),
		}));

		return {
			...order,
			mileage: order.mileage,
			totalAmount: order.totalAmount ? String(order.totalAmount) : '0',
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

	async update(id: string, updateOrderDto: UpdateOrderDto) {
		const existingOrder = await this.db.order.findUnique({
			where: { id },
			include: {
				services: true,
				parts: true,
			},
		});

		if (!existingOrder) {
			throw new NotFoundException('Order not found');
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

		const pricing = await this.buildOrderPricing(nextServices, nextParts);

		return this.db.$transaction(async tx => {
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
					totalAmount: pricing.totalAmount,
				},
			});

			if (updateOrderDto.services !== undefined) {
				await tx.orderService.deleteMany({ where: { orderId: id } });
				if (pricing.orderServicesData.length > 0) {
					await tx.orderService.createMany({
						data: pricing.orderServicesData.map(item => ({
							...item,
							orderId: id,
						})),
					});
				}
			}

			if (updateOrderDto.parts !== undefined) {
				await tx.orderPart.deleteMany({ where: { orderId: id } });
				if (pricing.orderPartsData.length > 0) {
					await tx.orderPart.createMany({
						data: pricing.orderPartsData.map(item => ({
							...item,
							orderId: id,
						})),
					});
				}
			}

			return updatedOrder;
		});
	}

	async updateBulk(data: BulkUpdateOrderDto) {
		const { ids, status, priority } = data;

		const updateData: Record<string, unknown> = {};

		if (status !== undefined) {
			updateData.status = status;
		}

		if (priority !== undefined) {
			updateData.priority = priority;
		}

		if (Object.keys(updateData).length === 0) {
			throw new BadRequestException('No fields provided for bulk update');
		}

		return this.db.order.updateMany({
			where: {
				id: { in: ids },
			},
			data: updateData,
		});
	}

	async getNewOrderMeta() {
		try {
			const [clients, vehicles, services, mechanics, parts] = await Promise.all(
				[
					this.db.client.findMany({
						select: {
							id: true,
							fullName: true,
							email: true,
							phone: true,
						},
					}),
					this.db.vehicle.findMany({
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
						where: { status: true },
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
						},
						select: {
							id: true,
							fullName: true,
						},
					}),
					this.db.part.findMany({
						where: {
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
				})),
				parts: parts.map(part => {
					// Calculate total stock and average price
					const totalStock = part.inventory.reduce(
						(sum, inv) => sum + inv.quantity,
						0,
					);
					const avgPurchasePrice =
						part.inventory.reduce(
							(sum, inv) => sum + Number(inv.purchasePrice) * inv.quantity,
							0,
						) / totalStock;

					// Default retail price calculation (30% markup)
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
						finalPrice = avgPurchasePrice * 1.3; // Default 30% markup
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

	private async buildOrderPricing(servicesInput: any[], partsInput: any[]) {
		const serviceIds = servicesInput.map(service => service.serviceId);
		const partIds = partsInput.map(part => part.partId);

		const [services, partsData] = await Promise.all([
			this.db.service.findMany({
				where: { id: { in: serviceIds } },
			}),
			this.db.part.findMany({
				where: { id: { in: partIds } },
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
			return {
				serviceId: serviceItem.serviceId,
				mechanicId: serviceItem.mechanicId || null,
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
