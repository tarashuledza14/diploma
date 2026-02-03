import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
	constructor(private readonly db: PrismaService) {}

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
