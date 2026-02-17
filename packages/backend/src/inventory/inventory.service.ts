import { Injectable } from '@nestjs/common';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetInventoryDto } from './dto/get-inventory.dto';

@Injectable()
export class InventoryService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
	) {}

	async getAll(input: GetInventoryDto) {
		const { skip, perPage } = this.paginationService.getPagination({
			page: input.page,
			perPage: input.perPage,
		});
		const filter = this.filterService.createFilter(
			input.filters,
			input.joinOperator,
			false,
		);
		console.log('input.sort', input.sort);
		const sortFilter = this.filterService.getSortFilter(input.sort);
		const [parts, total] = await Promise.all([
			this.db.part.findMany({
				where: filter,
				orderBy: sortFilter,
				skip,
				take: perPage,
				include: {
					category: true,
					brand: true,
					manufacturer: true,
					supplier: true,
				},
			}),
			this.db.part.count({ where: filter }),
		]);
		return {
			data: parts,
			total,
			pageCount: this.paginationService.getPageCount(total, perPage),
		};
	}

	async getAllDictionaries() {
		const [brands, categories, manufacturers, suppliers] = await Promise.all([
			this.db.partsBrand.findMany(),
			this.db.partCategory.findMany(),
			this.db.partsManufacturer.findMany(),
			this.db.partsSupplier.findMany(),
		]);
		return {
			brands,
			categories,
			manufacturers,
			suppliers,
		};
	}
}
