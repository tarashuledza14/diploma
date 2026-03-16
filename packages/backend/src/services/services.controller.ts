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
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './interfaces/get-services.interfaces';
import { ServiceService } from './services.service';

@Controller('services')
export class ServiceController {
	constructor(private readonly serviceService: ServiceService) {}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getServices(
		@Query()
		query: GetServicesDto,
	) {
		return this.serviceService.getServices(query);
	}
	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('dictionaries')
	async getDictionaries() {
		return this.serviceService.getDictionaries();
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async create(@Body() data: CreateServiceDto) {
		return this.serviceService.create(data);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Put()
	async update(@Body() data: UpdateServiceDto) {
		return this.serviceService.update(data);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete('bulk')
	async deleteBulk(@Body('ids') ids: string[]) {
		return this.serviceService.deleteBulk(ids);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch('bulk')
	async updateBulkStatus(
		@Body('ids') ids: string[],
		@Body('status') status: boolean,
	) {
		return this.serviceService.updateBulkStatus(ids, status);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete(':id')
	async deleteService(@Param('id') id: string) {
		return this.serviceService.deleteService(id);
	}
}
