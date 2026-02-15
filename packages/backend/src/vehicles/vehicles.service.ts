import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BulkUpdateVehicleDto } from './dto/bulk-update.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesDto } from './dto/get-vehicle.dto';

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
		return this.db.vehicle.create({
			data,
		});
	}

	async updateBulk(data: BulkUpdateVehicleDto) {
		const { ids, field, value } = data;
		return this.db.vehicle.updateMany({
			where: {
				id: { in: ids },
			},
			data: { [field]: value },
		});
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
		const filter = this.filterService.createFilter(input.filters);
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
		return this.db.vehicle.updateMany({
			where: {
				id: { in: ids },
			},
			data: { deletedAt: new Date() },
		});
	}
	async recalculateVehicleStats(vehicleId: string) {
		const orders = await this.db.order.findMany({
			where: { vehicleId },
			select: { endDate: true },
			orderBy: { endDate: 'desc' },
			take: 1,
		});

		const totalServices = await this.db.order.count({
			where: { vehicleId, status: 'COMPLETED' },
		});

		const lastServiceDate = orders.length > 0 ? orders[0].endDate : null;

		await this.db.vehicle.update({
			where: { id: vehicleId },
			data: {
				totalServices,
				lastService: lastServiceDate,
			},
		});
	}
}
