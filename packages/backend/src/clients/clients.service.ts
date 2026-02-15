import { BadRequestException, Injectable } from '@nestjs/common';
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
		try {
			return this.db.client.create({
				data,
			});
		} catch (error) {
			console.error('Error creating client:', error);
			throw error;
		}
	}

	async update(clientId: string, data: Partial<CreateClientDto>) {
		try {
			return this.db.client.update({
				where: { id: clientId },
				data,
			});
		} catch (error) {
			console.error('Error updating client:', error);
			throw new BadRequestException('Failed to update client');
		}
	}
	async getClientDetails(clientId: string) {
		try {
			return this.db.client.findUnique({
				where: { id: clientId },
				include: {
					vehicles: true,
					orders: true,
				},
			});
		} catch (error) {
			console.error('Error fetching client details:', error);
			throw new BadRequestException('Failed to fetch client details');
		}
	}

	async delete(clientId: string) {
		return this.db.client.update({
			where: { id: clientId },
			data: { deletedAt: new Date() },
		});
	}
	async deleteBulk(clientIds: string[]) {
		return this.db.client.updateMany({
			where: { id: { in: clientIds } },
			data: { deletedAt: new Date() },
		});
	}

	async getClients(input: GetClientsDto) {
		console.log('client data', input);
		try {
			const { skip: offset, perPage } = this.paginationService.getPagination({
				page: input.page,
				perPage: input.perPage,
			});
			const filters = this.filterService.createFilter(
				input.filters,
				input.joinOperator,
			);
			console.log('filters', JSON.stringify(filters));
			const sorts = this.filterService.getSortFilter(input.sort || []);
			const [clients, total] = await Promise.all([
				this.db.client.findMany({
					skip: offset,
					where: filters,
					take: input.perPage,
					orderBy: sorts,
				}),
				this.db.client.count({ where: filters }),
			]);

			const pageCount = this.paginationService.getPageCount(total, perPage);
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
