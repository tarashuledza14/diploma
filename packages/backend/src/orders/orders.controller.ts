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
import { BulkUpdateOrderDto } from './dto/bulk-update.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/filter.dto';
import { QuickUpdateOrderDto } from './dto/quick-update-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Post()
	create(
		@Body() createOrderDto: CreateOrderDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.ordersService.create(createOrderDto, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get()
	findAll(@Query() query: GetOrdersDto, @CurrentUser() user: AuthUser) {
		return this.ordersService.findAll(query, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Get('meta/new')
	getNewOrderMeta(@CurrentUser() user: AuthUser) {
		return this.ordersService.getNewOrderMeta(user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Get('recommended-parts')
	async getRecommendedParts(
		@Query('vehicleId') vehicleId: string,
		@Query('serviceId') serviceId: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.ordersService.getRecommendedParts(vehicleId, serviceId, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Get(':id')
	findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.ordersService.findOne(id, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
	@Patch('bulk')
	updateBulk(@Body() data: BulkUpdateOrderDto, @CurrentUser() user: AuthUser) {
		return this.ordersService.updateBulk(data, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch(':id/quick')
	quickUpdate(
		@Param('id') id: string,
		@Body() dto: QuickUpdateOrderDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.ordersService.quickUpdate(id, dto, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateOrderDto: UpdateOrderDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.ordersService.update(id, updateOrderDto, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete(':id')
	delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.ordersService.delete(id, user);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Delete()
	deleteBulk(@Body('ids') ids: string[], @CurrentUser() user: AuthUser) {
		return this.ordersService.deleteBulk(ids, user);
	}
}
