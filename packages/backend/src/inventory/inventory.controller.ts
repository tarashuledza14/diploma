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
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { GetInventoryDto } from './dto/get-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	async getAll(@Query() params: GetInventoryDto, @CurrentUser() user: AuthUser) {
		console.log('GET', params);
		return this.inventoryService.getAll(params, user);
	}
	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('dictionaries')
	async getAllDictionaries() {
		return this.inventoryService.getAllDictionaries();
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Put()
	async updatePart(@Body() data: Part, @CurrentUser() user: AuthUser) {
		return this.inventoryService.updatePart(data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('stats')
	async getStats(@CurrentUser() user: AuthUser) {
		return this.inventoryService.getStatistics(user);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	async createPart(@Body() data: any, @CurrentUser() user: AuthUser) {
		console.log('data', data);
		return this.inventoryService.createPart(data, user);
	}
	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get('movement-history/:partId')
	async getMovementHistory(
		@Param('partId') partId: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.inventoryService.getPartMovementHistory(partId, user);
	}
	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete('bulk')
	async deleteBulk(@Body('ids') ids: string[], @CurrentUser() user: AuthUser) {
		return this.inventoryService.deleteBulk(ids, user);
	}
}
