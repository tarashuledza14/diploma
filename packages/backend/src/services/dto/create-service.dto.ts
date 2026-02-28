import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
	@IsString()
	name: string;

	@IsString()
	description: string;

	@IsNumber()
	price: number;

	@IsNumber()
	estimatedTime: number;

	@IsBoolean()
	status: boolean;

	@IsOptional()
	@IsString()
	categoryId?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	requiredCategoryIds?: string[];
}
