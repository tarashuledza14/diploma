import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DmsController } from './dms.controller';
import { DmsService } from './dms.service';

@Module({
	imports: [ConfigModule],
	controllers: [DmsController],
	providers: [DmsService],
	exports: [DmsService],
})
export class DmsModule {}
