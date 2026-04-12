import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './interfaces/get-services.interfaces';

@Injectable()
export class ServiceService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
	) {}

	private assertOrganizationId(user: AuthUser): string {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return user.organizationId;
	}

	async deleteService(id: string, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const result = await this.db.service.deleteMany({
				where: {
					id,
					organizationId,
				},
			});

			return { deleted: result.count };
		} catch (error) {
			console.error('Error deleting service:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async deleteBulk(ids: string[], actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			await this.db.service.deleteMany({
				where: {
					id: { in: ids },
					organizationId,
				},
			});
			return { deleted: ids.length };
		} catch (error) {
			console.error('Error deleting services in bulk:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async updateBulkStatus(ids: string[], status: boolean, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const result = await this.db.service.updateMany({
				where: {
					id: { in: ids },
					organizationId,
				},
				data: { status },
			});
			return { count: result.count };
		} catch (error) {
			console.error('Error updating services status in bulk:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async create(data: CreateServiceDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			return this.db.service.create({
				data: {
					organizationId,
					name: data.name,
					description: data.description,
					price: data.price,
					estimatedTime: data.estimatedTime,
					status: data.status,
					categoryId: data.categoryId || null,
					requiredCategories: data.requiredCategoryIds?.length
						? { connect: data.requiredCategoryIds.map(id => ({ id })) }
						: undefined,
				},
				include: {
					category: true,
					requiredCategories: { select: { id: true, name: true } },
				},
			});
		} catch (error) {
			console.error('Error creating service:', error);
			throw new InternalServerErrorException(error);
		}
	}

	async update(data: UpdateServiceDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const { id, requiredCategoryIds, categoryId, ...rest } = data;
			const updateData: Prisma.ServiceUpdateInput = {
				...rest,
				...(categoryId != null && categoryId !== ''
					? { category: { connect: { id: categoryId } } }
					: categoryId === null || categoryId === ''
						? { category: { disconnect: true } }
						: {}),
			};
			if (requiredCategoryIds !== undefined) {
				updateData.requiredCategories = {
					set: requiredCategoryIds.map(id => ({ id })),
				};
			}
			const candidate = await this.db.service.findFirst({
				where: {
					id,
					organizationId,
				},
				select: { id: true },
			});

			if (!candidate) {
				throw new ForbiddenException('Service not found in your organization');
			}

			return this.db.service.update({
				where: { id },
				data: updateData,
				include: {
					category: true,
					requiredCategories: { select: { id: true, name: true } },
				},
			});
		} catch (error) {
			console.error('Error updating service:', error);
			if (error instanceof ForbiddenException) {
				throw error;
			}
			throw new InternalServerErrorException(error);
		}
	}

	async getServices(input: GetServicesDto, actor: AuthUser) {
		const organizationId = this.assertOrganizationId(actor);
		try {
			const { skip: offset, perPage } = this.paginationService.getPagination({
				page: input.page,
				perPage: input.perPage,
			});
			const filters = this.filterService.createFilter(
				input.filters,
				input.joinOperator,
				false,
			);
			const scopedFilters = {
				AND: [
					filters,
					{
						organizationId,
					},
				],
			};
			const sorts = this.filterService.getSortFilter(input.sort || []);
			const [services, total] = await Promise.all([
				this.db.service.findMany({
					skip: offset,
					where: scopedFilters,
					take: input.perPage,
					orderBy: sorts,
					include: {
						category: true,
						requiredCategories: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				}),
				this.db.service.count({ where: scopedFilters }),
			]);

			const pageCount = this.paginationService.getPageCount(total, perPage);
			return {
				data: services,
				pageCount,
				total,
			};
		} catch (error) {
			console.error('Error fetching services:', error);
			throw new InternalServerErrorException(error);
		}
	}
	async getDictionaries() {
		try {
			const [serviceCategories, partCategories] = await Promise.all([
				this.db.serviceCategory.findMany({
					select: {
						id: true,
						name: true,
					},
				}),
				this.db.partCategory.findMany({
					select: {
						id: true,
						name: true,
					},
				}),
			]);
			return {
				serviceCategories,
				partCategories,
			};
		} catch (error) {
			console.error('Error fetching categories:', error);
			throw new InternalServerErrorException(error);
		}
	}
}
