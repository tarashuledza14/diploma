import { Module } from '@nestjs/common';
import { DispatchingController } from './dispatching.controller';
import { DispatchingService } from './dispatching.service';

@Module({
	controllers: [DispatchingController],
	providers: [DispatchingService],
	exports: [DispatchingService],
})
export class DispatchingModule {}
