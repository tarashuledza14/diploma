import { Global, Module } from '@nestjs/common';
import { FilterService } from './filter.service';

@Global()
@Module({
	providers: [FilterService],
	exports: [FilterService],
})
export class FilterModule {}
