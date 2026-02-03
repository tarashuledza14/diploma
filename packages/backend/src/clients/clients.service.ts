import { Injectable } from '@nestjs/common';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { GetClientsDto } from './dto/get-clients.dto';

@Injectable()
export class ClientsService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
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
			const filters = this.filterService.createFilter(
				input.filters,
				input.joinOperator,
			);
			const sorts = this.filterService.getSortFilter(input.sort || []);
			const [clients, total] = await Promise.all([
				this.db.client.findMany({
					skip: offset,
					where: filters,
					take: input.perPage,
					orderBy: sorts,
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
}
