import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaginationService } from 'src/pagination/pagination.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
	imports: [NotificationsModule],
	controllers: [OrdersController],
	providers: [OrdersService, PaginationService],
})
export class OrdersModule {}
