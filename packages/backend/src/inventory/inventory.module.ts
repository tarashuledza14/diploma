import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
	imports: [NotificationsModule],
	controllers: [InventoryController],
	providers: [InventoryService],
})
export class InventoryModule {}
