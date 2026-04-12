import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/types/auth-user.type';
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

	private assertOrganizationId(user: AuthUser): string {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return user.organizationId;
	}

	async create(data: CreateClientDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			return this.db.client.create({
				data: {
					...data,
					organizationId,
				},
			});
		} catch (error) {
			console.error('Error creating client:', error);
			throw error;
		}
	}

	async update(
		clientId: string,
		data: Partial<CreateClientDto>,
		actor: AuthUser,
	) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const client = await this.db.client.findFirst({
				where: {
					id: clientId,
					organizationId,
				},
				select: { id: true },
			});

			if (!client) {
				throw new NotFoundException('Client not found');
			}

			return this.db.client.update({
				where: { id: clientId },
				data,
			});
		} catch (error) {
			console.error('Error updating client:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Failed to update client');
		}
	}
	async getClientDetails(clientId: string, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const client = await this.db.client.findFirst({
				where: {
					id: clientId,
					organizationId,
				},
				include: {
					vehicles: true,
					orders: true,
				},
			});

			if (!client) {
				throw new NotFoundException('Client not found');
			}

			return client;
		} catch (error) {
			console.error('Error fetching client details:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Failed to fetch client details');
		}
	}

	async delete(clientId: string, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		const client = await this.db.client.findFirst({
			where: {
				id: clientId,
				organizationId,
			},
			select: { id: true },
		});

		if (!client) {
			throw new NotFoundException('Client not found');
		}

		return this.db.client.update({
			where: { id: clientId },
			data: { deletedAt: new Date() },
		});
	}
	async deleteBulk(clientIds: string[], actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		return this.db.client.updateMany({
			where: {
				id: { in: clientIds },
				organizationId,
			},
			data: { deletedAt: new Date() },
		});
	}

	async getClients(input: GetClientsDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
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
			const where = {
				AND: [
					filters,
					{
						organizationId,
						deletedAt: null,
					},
				],
			};
			console.log('filters', JSON.stringify(filters));
			const sorts = this.filterService.getSortFilter(input.sort || []);
			const orderBy = sorts.length ? sorts : [{ fullName: 'asc' as const }];
			const [clients, total] = await Promise.all([
				this.db.client.findMany({
					skip: offset,
					where,
					take: input.perPage,
					orderBy,
				}),
				this.db.client.count({ where }),
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
			this.db.vehicle.count({
				where: { ownerId: clientId, deletedAt: null },
			}),
			this.db.order.aggregate({
				where: { clientId, deletedAt: null },
				_count: true,
				_sum: { totalAmount: true },
			}),
			this.db.order.findFirst({
				where: { clientId, deletedAt: null },
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
