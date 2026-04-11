import { IsOptional, IsString } from 'class-validator';
import { CombinedFilterAndPagination } from 'src/filter/dto/filter.dto';

export class GetTeamUsersDto extends CombinedFilterAndPagination {
	@IsOptional()
	@IsString()
	fullName?: string;
}
