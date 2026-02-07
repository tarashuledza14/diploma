import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
	constructor(
		private readonly db: PrismaService,
		private readonly filterService: FilterService,
		private readonly paginationService: PaginationService,
	) {}

	async create(data: CreateVehicleDto) {
		const client = await this.db.user.findUnique({
			where: { id: data.ownerId },
		});
		if (!client) {
			throw new BadRequestException('Client not found');
		}
		return this.db.vehicle.create({
			data,
		});
	}

	// async get();
}
