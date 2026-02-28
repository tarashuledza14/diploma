import { Module } from '@nestjs/common';
import { ServiceController } from './services.controller';
import { ServiceService } from './services.service';

@Module({
	controllers: [ServiceController],
	providers: [ServiceService],
})
export class ServiceModule {}
