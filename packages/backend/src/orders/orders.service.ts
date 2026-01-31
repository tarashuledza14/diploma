import { Injectable } from '@nestjs/common'
import { OrderPriority, OrderStatus, Prisma } from 'prisma/generated/prisma/client'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { GetAllOrderDto } from './dto/filter.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrdersService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
	) {}
	create(createOrderDto: CreateOrderDto) {
		// this.db.order.create({ data: {
		// 	...createOrderDto,
		// 	client: { connect: { id: createOrderDto.clientId } },
		// 	car: { connect: { id: createOrderDto.carId } },

		// } });
	}

	async findAll(dto: GetAllOrderDto) {
		const { perPage, skip } = this.paginationService.getPagination(dto);
		const filters = this.createFilter(dto);

		return this.db.order.findMany({
			where: filters,
			// orderBy: this.getSortOption(dto.sort),
			skip,
			take: perPage,
			// select: returnProductObject,
		});
	}
	private createFilter(dto: GetAllOrderDto): Prisma.OrderWhereInput {
		const filters: Prisma.OrderWhereInput[] = [];
		if (dto.status) {
			filters.push(this.getStatusFilter(dto.status));
		}
		if (dto.priority) {
			filters.push(this.getPriorityFilter(dto.priority));
		}
		return filters.length ? { AND: filters } : {};
	}
	getStatusFilter(status: string): Prisma.OrderWhereInput {
		return { status: status as OrderStatus };
	}
	getPriorityFilter(priority: string): Prisma.OrderWhereInput {
		return { priority: priority as OrderPriority };
	}
	findOne(id: number) {
		return `This action returns a #${id} order`;
	}

	update(id: number, updateOrderDto: UpdateOrderDto) {
		return `This action updates a #${id} order`;
	}

	remove(id: number) {
		return `This action removes a #${id} order`;
	}
}
