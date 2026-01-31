import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { VehicleStatus } from 'prisma/generated/prisma/enums'

export class CreateVehicleDto {
	@IsString()
	ownerId: string;

	@IsString()
	brand: string;

	@IsString()
	model: string;

	@IsNumber()
	year: number;

	@IsString()
	color: string;

	@IsString()
	plate: string;

	@IsString()
	vin: string;

	@IsNumber()
	mileage: number;

	@IsEnum(VehicleStatus)
	status: VehicleStatus;

	@IsOptional()
	@IsString()
	notes?: string;
}