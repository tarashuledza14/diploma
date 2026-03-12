import { IsOptional, IsString } from 'class-validator';

export class QuickUpdateOrderDto {
	@IsString()
	@IsOptional()
	mechanicId?: string | null;

	@IsString()
	@IsOptional()
	endDate?: string | null;
}
