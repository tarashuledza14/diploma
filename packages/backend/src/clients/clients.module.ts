import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/pagination/pagination.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
	controllers: [ClientsController],
	providers: [ClientsService],
	imports: [PaginationModule],
})
export class ClientsModule {}
