import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { Part, Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getAll(@Query() params: GetInventoryDto) {
		console.log('GET', params);
		return this.inventoryService.getAll(params);
	}
	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('dictionaries')
	async getAllDictionaries() {
		return this.inventoryService.getAllDictionaries();
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Put()
	async updatePart(@Body() data: Part) {
		return this.inventoryService.updatePart(data);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('stats')
	async getStats() {
		return this.inventoryService.getStatistics();
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createPart(@Body() data: any) {
		console.log('data', data);
		return this.inventoryService.createPart(data);
	}
	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('movement-history/:partId')
	async getMovementHistory(@Param('partId') partId: string) {
		return this.inventoryService.getPartMovementHistory(partId);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete('bulk')
	async deleteBulk(@Body('ids') ids: string[]) {
		return this.inventoryService.deleteBulk(ids);
	}
}
