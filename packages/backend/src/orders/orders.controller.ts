import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { BulkUpdateOrderDto } from './dto/bulk-update.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/filter.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	findAll(@Query() query: GetOrdersDto) {
		return this.ordersService.findAll(query);
	}

	@Get('meta/new')
	getNewOrderMeta() {
		return this.ordersService.getNewOrderMeta();
	}

	/**
	 * Get recommended parts for a vehicle and service
	 * GET /orders/recommended-parts?vehicleId=...&serviceId=...
	 */
	@Get('recommended-parts')
	async getRecommendedParts(
		@Query('vehicleId') vehicleId: string,
		@Query('serviceId') serviceId: string,
	) {
		return this.ordersService.getRecommendedParts(vehicleId, serviceId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.ordersService.findOne(id);
	}

	@Patch('bulk')
	updateBulk(@Body() data: BulkUpdateOrderDto) {
		return this.ordersService.updateBulk(data);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
		return this.ordersService.update(id, updateOrderDto);
	}
}
