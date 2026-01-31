import { IsEnum, IsOptional } from 'class-validator'
import { OrderPriority, OrderStatus } from 'prisma/generated/prisma/enums'
import { PaginationDto } from 'src/pagination/pagination.dto'

export class GetAllOrderDto extends PaginationDto {
	@IsOptional()
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@IsOptional()
	@IsEnum(OrderPriority)
	priority?: OrderPriority;
}
