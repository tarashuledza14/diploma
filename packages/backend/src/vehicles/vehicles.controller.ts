import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { BulkUpdateVehicleDto } from './dto/bulk-update.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesDto } from './dto/get-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
	constructor(private readonly vehiclesService: VehiclesService) {}

	@Post()
	async createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
		return this.vehiclesService.create(createVehicleDto);
	}

	@Get('status-counts')
	async getStatusCounts() {
		return this.vehiclesService.getStatusCounts();
	}

	@Get()
	async getAllVehicles(@Query() data: GetVehiclesDto) {
		console.log('data', data);
		return this.vehiclesService.getAll(data);
	}

	@Patch('bulk')
	async updateVehiclesBulk(
		@Body()
		data: BulkUpdateVehicleDto,
	) {
		return this.vehiclesService.updateBulk(data);
	}
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
