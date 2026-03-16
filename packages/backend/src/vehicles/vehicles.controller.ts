import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { BulkUpdateVehicleDto } from './dto/bulk-update.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesDto } from './dto/get-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
	constructor(private readonly vehiclesService: VehiclesService) {}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
		return this.vehiclesService.create(createVehicleDto);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('status-counts')
	async getStatusCounts() {
		return this.vehiclesService.getStatusCounts();
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getAllVehicles(@Query() data: GetVehiclesDto) {
		console.log('data', data);
		return this.vehiclesService.getAll(data);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch('bulk')
	async updateVehiclesBulk(
		@Body()
		data: BulkUpdateVehicleDto,
	) {
		return this.vehiclesService.updateBulk(data);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete('bulk')
	async deleteVehiclesBulk(
		@Body()
		data: {
			ids: string[];
		},
	) {
		return this.vehiclesService.deleteBulk(data.ids);
	}
}
