import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { DispatchingModule } from './dispatching/dispatching.module';
import { DmsModule } from './dms/dms.module';
import { FilterModule } from './filter/filter.module';
import { InventoryModule } from './inventory/inventory.module';
import { LangchainIntegrationModule } from './langchain-integration/langchain-integration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PaginationModule } from './pagination/pagination.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceModule } from './services/services.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 120,
			},
		]),
		AppSettingsModule,
		AuthModule,
		UserModule,
		PrismaModule,
		OrdersModule,
		PaginationModule,
		VehiclesModule,
		ClientsModule,
		DispatchingModule,
		FilterModule,
		InventoryModule,
		ServiceModule,
		LangchainIntegrationModule,
		NotificationsModule,
		DmsModule,
		TeamModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
