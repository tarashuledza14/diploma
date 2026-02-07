import { IsOptional, IsString } from 'class-validator';
import { CombinedFilterAndPagination } from 'src/filter/dto/filter.dto';

export class GetClientsDto extends CombinedFilterAndPagination {
	@IsOptional()
	@IsString()
	fullName?: string;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	@IsString()
	phone?: string;
}
