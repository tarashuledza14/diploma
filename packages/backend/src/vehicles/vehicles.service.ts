import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from 'prisma/generated/prisma/client';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BulkUpdateVehicleDto } from './dto/bulk-update.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesDto } from './dto/get-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
	constructor(
		private readonly db: PrismaService,
		private readonly filterService: FilterService,
		private readonly paginationService: PaginationService,
	) {}

	async create(data: CreateVehicleDto) {
		const client = await this.db.client.findUnique({
			where: { id: data.ownerId },
		});
		if (!client) {
			throw new BadRequestException('Client not found');
		}
		const createdVehicle = await this.db.vehicle.create({
			data,
		});

		await this.recalculateClientVehicleCount(createdVehicle.ownerId);

		return createdVehicle;
	}

	async update(id: string, data: UpdateVehicleDto) {
		const existingVehicle = await this.db.vehicle.findUnique({
			where: { id },
			select: { ownerId: true },
		});

		if (!existingVehicle) {
			throw new BadRequestException('Vehicle not found');
		}

		if (data.ownerId) {
			const client = await this.db.client.findUnique({
				where: { id: data.ownerId },
			});

			if (!client) {
				throw new BadRequestException('Client not found');
			}
		}

		const updatedVehicle = await this.db.vehicle.update({
			where: { id },
			data,
		});

		await Promise.all([
			this.recalculateClientVehicleCount(existingVehicle.ownerId),
			...(updatedVehicle.ownerId !== existingVehicle.ownerId
				? [this.recalculateClientVehicleCount(updatedVehicle.ownerId)]
				: []),
		]);

		return updatedVehicle;
	}

	async updateBulk(data: BulkUpdateVehicleDto) {
		const { ids, field, value } = data;
		const previousOwners =
			field === 'ownerId'
				? await this.db.vehicle.findMany({
						where: { id: { in: ids } },
						select: { ownerId: true },
					})
				: [];

		if (field === 'ownerId') {
			const client = await this.db.client.findUnique({ where: { id: value } });
			if (!client) {
				throw new BadRequestException('Client not found');
			}
		}

		const result = await this.db.vehicle.updateMany({
			where: {
				id: { in: ids },
			},
			data: { [field]: value },
		});

		if (field === 'ownerId') {
			const ownerIds = [
				...new Set([...previousOwners.map(item => item.ownerId), value]),
			];

			await Promise.all(
				ownerIds.map(ownerId => this.recalculateClientVehicleCount(ownerId)),
			);
		}

		return result;
	}

	async getStatusCounts() {
		const counts = await this.db.vehicle.groupBy({
			by: ['status'],
			_count: { status: true },
		});
		return counts.reduce(
			(acc, item) => {
				acc[item.status] = item._count.status;
				return acc;
			},
			{} as Record<string, number>,
		);
	}

	async getAll(input: GetVehiclesDto) {
		const { skip, perPage } = this.paginationService.getPagination({
			page: input.page,
			perPage: input.perPage,
		});
		const filter = this.filterService.createFilter(
			input.filters,
			input.joinOperator,
		);
		const sortFilter = this.filterService.getSortFilter(input.sort);
		const [vehicles, total] = await Promise.all([
			this.db.vehicle.findMany({
				where: filter,
				orderBy: sortFilter,
				skip,
				take: perPage,
				include: {
					owner: {
						select: {
							id: true,
							fullName: true,
						},
					},
				},
			}),
			this.db.vehicle.count({ where: filter }),
		]);
		return {
			data: vehicles,
			total,
			pageCount: this.paginationService.getPageCount(total, perPage),
		};
	}

	async syncServiceCompleted(vehicleId: string, serviceDate: Date) {
		await this.db.vehicle.update({
			where: { id: vehicleId },
			data: {
				totalServices: { increment: 1 },
				lastService: serviceDate,
			},
		});
	}

	async syncTotalServices(vehicleId: string, increment: boolean) {
		await this.db.vehicle.update({
			where: { id: vehicleId },
			data: {
				totalServices: {
					[increment ? 'increment' : 'decrement']: 1,
				},
			},
		});
	}

	async updateLastService(vehicleId: string, serviceDate: Date) {
		await this.db.vehicle.update({
			where: { id: vehicleId },
			data: { lastService: serviceDate },
		});
	}

	async deleteBulk(ids: string[]) {
		const affectedVehicles = await this.db.vehicle.findMany({
			where: {
				id: { in: ids },
				deletedAt: null,
			},
			select: { ownerId: true },
		});

		const result = await this.db.vehicle.updateMany({
			where: {
				id: { in: ids },
			},
			data: { deletedAt: new Date() },
		});

		const ownerIds = [...new Set(affectedVehicles.map(item => item.ownerId))];
		await Promise.all(
			ownerIds.map(ownerId => this.recalculateClientVehicleCount(ownerId)),
		);

		return result;
	}
	async recalculateVehicleStats(vehicleId: string) {
		const [totalServices, latestCompletedOrder] = await Promise.all([
			this.db.order.count({
				where: {
					vehicleId,
					deletedAt: null,
					status: OrderStatus.COMPLETED,
				},
			}),
			this.db.order.findFirst({
				where: {
					vehicleId,
					deletedAt: null,
					status: OrderStatus.COMPLETED,
					endDate: { not: null },
				},
				select: { endDate: true },
				orderBy: { endDate: 'desc' },
			}),
		]);

		await this.db.vehicle.update({
			where: { id: vehicleId },
			data: {
				totalServices,
				lastService: latestCompletedOrder?.endDate || null,
			},
		});
	}

	private async recalculateClientVehicleCount(clientId: string) {
		const activeVehiclesCount = await this.db.vehicle.count({
			where: {
				ownerId: clientId,
				deletedAt: null,
			},
		});

		await this.db.client.update({
			where: { id: clientId },
			data: { vehicleCount: activeVehiclesCount },
		});
	}
}
