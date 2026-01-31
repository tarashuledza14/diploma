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
import { CreateOrderDto } from './dto/create-order.dto';
import { GetAllOrderDto } from './dto/filter.dto';
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
	findAll(@Query() query: GetAllOrderDto) {
		return this.ordersService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.ordersService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
		return this.ordersService.update(+id, updateOrderDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.ordersService.remove(+id);
	}
}
