import { Injectable } from '@nestjs/common';
import {
	Part,
	PartCategory,
	PartsBrand,
	PartsSupplier,
} from 'prisma/generated/prisma/client';
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

	async createPart(data: Partial<Part>) {
		return this.db.part.create({
			data,
		});
	}

	async updatePart(
		data: Omit<
			Part,
			'categoryId' | 'brandId' | 'manufacturerId' | 'supplierId'
		> & {
			category?: PartCategory | null;
			brand?: PartsBrand | null;
			manufacturer?: any;
			supplier?: PartsSupplier | null;
		},
	) {
		const {
			id,
			category,
			brand,
			manufacturer,
			supplier,
			movementHistory,
			createdAt,
			...rest
		} = data;

		return this.db.part.update({
			where: { id },
			data: {
				...rest,

				category: category?.id
					? { connect: { id: category.id } }
					: category === null
						? { disconnect: true }
						: undefined,

				brand: brand?.id
					? { connect: { id: brand.id } }
					: brand === null
						? { disconnect: true }
						: undefined,

				manufacturer: manufacturer?.id
					? { connect: { id: manufacturer.id } }
					: manufacturer === null
						? { disconnect: true }
						: undefined,

				supplier: supplier?.id
					? { connect: { id: supplier.id } }
					: supplier === null
						? { disconnect: true }
						: undefined,
			},
		});
	}

	async getStatistics() {
		const [totalParts, lowStock, outOfStock] = await Promise.all([
			this.db.part.count(),
			this.db.part.count({
				where: { quantityAvailable: { lte: 5 } },
			}),
			this.db.part.count({
				where: { quantityAvailable: 0 },
			}),
		]);

		const totalPurchaseSpent = await this.db.part.aggregate({
			_sum: { purchasePrice: true, retailPrice: true, quantityReserved: true },
		});

		return {
			totalParts,
			lowStock,
			outOfStock,
			...totalPurchaseSpent._sum,
		};
	}

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
				omit: {
					categoryId: true,
					brandId: true,
					manufacturerId: true,
					supplierId: true,
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
