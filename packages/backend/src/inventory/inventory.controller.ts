import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { Part } from 'prisma/generated/prisma/client';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { InventoryService } from './inventory.service';

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

	@Put('parts')
	async updatePart(@Body() data: Part) {
		return this.inventoryService.updatePart(data);
	}

	@Get('stats')
	async getStats() {
		return this.inventoryService.getStatistics();
	}
}
