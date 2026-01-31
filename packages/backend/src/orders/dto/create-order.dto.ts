import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'
import { OrderStatus } from 'prisma/generated/prisma/enums'

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	clientId: string;

	@IsString()
	@IsNotEmpty()
	carId: string;

	@IsArray()
	@IsNotEmpty()
	services: string[];

	@IsEnum(OrderStatus)
	@IsNotEmpty()
	status: OrderStatus;

	@IsString()
	@IsNotEmpty()
	priority: string;

	@IsString()
	@IsOptional()
	assignedMechanic: string;

	@IsString()
	@IsNotEmpty()
	dueDate: string;

	@IsString()
	@IsOptional()
	notes: string;
}
