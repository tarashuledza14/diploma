import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './interfaces/get-services.interfaces';
import { ServiceService } from './services.service';

@Controller('services')
export class ServiceController {
	constructor(private readonly serviceService: ServiceService) {}

	@Get()
	async getServices(
		@Query()
		query: GetServicesDto,
	) {
		return this.serviceService.getServices(query);
	}
	@Get('dictionaries')
	async getDictionaries() {
		return this.serviceService.getDictionaries();
	}
	@Post()
	async create(@Body() data: CreateServiceDto) {
		return this.serviceService.create(data);
	}
	@Put()
	async update(@Body() data: UpdateServiceDto) {
		return this.serviceService.update(data);
	}
	@Delete('bulk')
	async deleteBulk(@Body('ids') ids: string[]) {
		return this.serviceService.deleteBulk(ids);
	}
	@Patch('bulk')
	async updateBulkStatus(
		@Body('ids') ids: string[],
		@Body('status') status: boolean,
	) {
		return this.serviceService.updateBulkStatus(ids, status);
	}
	@Delete(':id')
	async deleteService(@Param('id') id: string) {
		return this.serviceService.deleteService(id);
	}
}
