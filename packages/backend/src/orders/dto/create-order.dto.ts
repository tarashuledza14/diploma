import { Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';
import { OrderPriority, OrderStatus } from 'prisma/generated/prisma/enums';

class CreateOrderServiceDto {
	@IsString()
	@IsNotEmpty()
	serviceId: string;

	@IsString()
	@IsOptional()
	mechanicId?: string;
}

class CreateOrderPartDto {
	@IsString()
	@IsNotEmpty()
	partId: string;

	@IsNumber()
	@IsPositive()
	quantity: number;
}

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	clientId: string;

	@IsString()
	@IsNotEmpty()
	vehicleId: string;

	@IsNumber()
	@IsPositive()
	mileage: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateOrderServiceDto)
	services: CreateOrderServiceDto[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateOrderPartDto)
	parts: CreateOrderPartDto[];

	@IsEnum(OrderStatus)
	@IsNotEmpty()
	status: OrderStatus;

	@IsEnum(OrderPriority)
	@IsNotEmpty()
	priority: OrderPriority;

	@IsString()
	@IsOptional()
	notes: string;

	@IsString()
	@IsOptional()
	endDate?: string;
}
