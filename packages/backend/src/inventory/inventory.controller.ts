import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { Part } from 'prisma/generated/prisma/client';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { InventoryService } from './inventory.service';

@Auth(Role.ADMIN, Role.MANAGER)
@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@Get()
	async getAll(@Query() params: GetInventoryDto) {
		console.log('GET', params);
		return this.inventoryService.getAll(params);
	}
	@Get('dictionaries')
	async getAllDictionaries() {
		return this.inventoryService.getAllDictionaries();
	}

	@Put()
	async updatePart(@Body() data: Part) {
		return this.inventoryService.updatePart(data);
	}

	@Get('stats')
	async getStats() {
		return this.inventoryService.getStatistics();
	}
	@Post()
	async createPart(@Body() data: any) {
		console.log('data', data);
		return this.inventoryService.createPart(data);
	}
	@Get('movement-history/:partId')
	async getMovementHistory(@Query('partId') partId: string) {
		return this.inventoryService.getPartMovementHistory(partId);
	}
	@Delete('bulk')
	async deleteBulk(@Body('ids') ids: string[]) {
		return this.inventoryService.deleteBulk(ids);
	}
}
