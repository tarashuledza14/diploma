import { Module } from '@nestjs/common';
import { PaginationService } from 'src/pagination/pagination.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
	controllers: [OrdersController],
	providers: [OrdersService, PaginationService],
})
export class OrdersModule {}
