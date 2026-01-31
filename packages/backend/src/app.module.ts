import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { OrdersModule } from './orders/orders.module';
import { PaginationModule } from './pagination/pagination.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule, 
    UserModule,
    PrismaModule,
    OrdersModule,
    PaginationModule,
    VehiclesModule,
    ClientsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
