import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import {
	FilterItem,
	FilterOperators,
	GetClientsDto,
	SortItem,
} from './dto/get-clients.dto';

@Injectable()
export class ClientsService {
	constructor(
		private readonly db: PrismaService,
		private paginationService: PaginationService,
	) {}

	async create(data: CreateClientDto) {
		return this.db.client.create({
			data,
		});
	}

	async getClients(input: GetClientsDto) {
		try {
			const { skip: offset } = this.paginationService.getPagination({
				page: input.page,
				perPage: input.perPage,
			});
			const filters = this.createFilter(input.filters);
			const [clients, total] = await Promise.all([
				this.db.client.findMany({
					skip: offset,
					where: filters,
					take: input.perPage,
					orderBy: this.getSortFilter(input.sort || []),
					select: {
						id: true,
						fullName: true,
						email: true,
						phone: true,
						notes: true,
						createdAt: true,
						updatedAt: true,
						totalSpent: true,
						totalOrders: true,
						vehicleCount: true,
						latestVisit: true,
					},
				}),
				this.db.client.count(),
			]);

			const pageCount = Math.ceil(total / input.perPage);

			return {
				data: clients.map(client => ({
					...client,
					email: client.email || '',
					totalSpent: Number(client.totalSpent),
				})),
				pageCount,
				total,
			};
		} catch (error) {
			console.error('Error fetching clients:', error);
			return { data: [], pageCount: 0, total: 0 };
		}
	}

	async syncVehicleCount(clientId: string, increment: boolean) {
		await this.db.client.update({
			where: { id: clientId },
			data: {
				vehicleCount: {
					[increment ? 'increment' : 'decrement']: 1,
				},
			},
		});
	}

	async syncOrderAdded(clientId: string, orderAmount: number, orderDate: Date) {
		await this.db.client.update({
			where: { id: clientId },
			data: {
				totalOrders: { increment: 1 },
				totalSpent: { increment: orderAmount },
				latestVisit: orderDate,
			},
		});
	}

	async syncOrderUpdated(
		clientId: string,
		oldAmount: number,
		newAmount: number,
	) {
		const diff = newAmount - oldAmount;
		await this.db.client.update({
			where: { id: clientId },
			data: {
				totalSpent: { increment: diff },
			},
		});
	}

	async recalculateClientStats(clientId: string) {
		const [vehicles, orders, latestOrder] = await Promise.all([
			this.db.vehicle.count({ where: { ownerId: clientId } }),
			this.db.order.aggregate({
				where: { clientId },
				_count: true,
				_sum: { totalAmount: true },
			}),
			this.db.order.findFirst({
				where: { clientId },
				orderBy: { startDate: 'desc' },
				select: { startDate: true },
			}),
		]);

		await this.db.client.update({
			where: { id: clientId },
			data: {
				vehicleCount: vehicles,
				totalOrders: orders._count,
				totalSpent: orders._sum.totalAmount || 0,
				latestVisit: latestOrder?.startDate || null,
			},
		});
	}

	private getSortFilter(
		sort: SortItem[],
	): Prisma.ClientOrderByWithRelationInput[] {
		if (!sort || sort.length === 0) {
			return [{ createdAt: 'desc' }];
		}

		const validClientFields = Object.values(
			Prisma.ClientScalarFieldEnum,
		) as string[];

		return sort.map(sortItem => {
			const direction = sortItem.desc ? 'desc' : 'asc';

			if (validClientFields.includes(sortItem.id)) {
				return { [sortItem.id]: direction };
			}

			return { createdAt: 'desc' };
		});
	}

	private createFilter(filtersData?: FilterItem[]) {
		let filters: Prisma.ClientWhereInput[] = [];
		for (let item of filtersData) {
			console.log('item', item);
			switch (item.operator) {
				case FilterOperators.CONTAINS:
					filters.push(this.getContainsFilter(item.id, item.value));
					break;
				case FilterOperators.NOT_CONTAIN:
					filters.push(this.getNotContainFilter(item.id, item.value));
					break;
				case FilterOperators.EQUALS:
					filters.push(this.getEqualsFilter(item.id, item.value));
					break;
				case FilterOperators.NOT_EQUALS:
					filters.push(this.getNotEquals(item.id, item.value));
					break;
			}
		}
		return filters.length ? { AND: filters } : {};
	}
	private getContainsFilter(
		field: string,
		value: string,
	): Prisma.ClientWhereInput {
		console.log('CONTAINS');
		return {
			[field]: {
				contains: value,
				mode: 'insensitive',
			},
		};
	}
	private getNotContainFilter(
		field: string,
		value: string,
	): Prisma.ClientWhereInput {
		return {
			NOT: {
				[field]: {
					contains: value,
					mode: 'insensitive',
				},
			},
		};
	}
	private getEqualsFilter(
		field: string,
		value: string,
	): Prisma.ClientWhereInput {
		return {
			[field]: { equals: value, mode: 'insensitive' },
		};
	}
	private getNotEquals(field: string, value: string): Prisma.ClientWhereInput {
		return {
			NOT: {
				[field]: { equals: value, mode: 'insensitive' },
			},
		};
	}
}
