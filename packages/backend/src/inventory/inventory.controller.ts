import { Controller, Get, Query } from '@nestjs/common';
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
}
