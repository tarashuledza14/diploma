import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import {
	CombinedFilterAndPagination,
	SortItem,
} from 'src/filter/dto/filter.dto';

export class GetClientsDto extends CombinedFilterAndPagination {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SortItem)
	sort?: SortItem[] = [];

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
