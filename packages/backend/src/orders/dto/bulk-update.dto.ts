import {
	ArrayNotEmpty,
	IsArray,
	IsOptional,
	IsString,
} from 'class-validator';

export class BulkUpdateOrderDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	ids: string[];

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	priority?: string;
}

