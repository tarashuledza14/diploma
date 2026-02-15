import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BulkUpdateVehicleDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	ids: string[];

	@IsString()
	@IsNotEmpty()
	field: string;

	@IsString()
	@IsNotEmpty()
	value: string;
}
