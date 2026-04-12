import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { BulkUpdateVehicleDto } from './dto/bulk-update.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesDto } from './dto/get-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
	constructor(private readonly vehiclesService: VehiclesService) {}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createVehicle(
		@Body() createVehicleDto: CreateVehicleDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.vehiclesService.create(createVehicleDto, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('status-counts')
	async getStatusCounts(@CurrentUser() user: AuthUser) {
		return this.vehiclesService.getStatusCounts(user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getAllVehicles(@Query() data: GetVehiclesDto, @CurrentUser() user: AuthUser) {
		return this.vehiclesService.getAll(data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch('bulk')
	async updateVehiclesBulk(
		@Body()
		data: BulkUpdateVehicleDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.vehiclesService.updateBulk(data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch(':id')
	async updateVehicle(
		@Param('id') id: string,
		@Body() data: UpdateVehicleDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.vehiclesService.update(id, data, user);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete('bulk')
	async deleteVehiclesBulk(
		@Body()
		data: {
			ids: string[];
		},
		@CurrentUser() user: AuthUser,
	) {
		return this.vehiclesService.deleteBulk(data.ids, user);
	}
}
