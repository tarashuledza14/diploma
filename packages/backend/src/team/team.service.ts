import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { randomBytes } from 'crypto';
import { OrderStatus, Role } from 'prisma/generated/prisma/client';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { FilterService } from 'src/filter/filter.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { GetTeamUsersDto } from './dto/get-team-users.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';

type AccountStatus = 'ACTIVE' | 'PENDING_CONFIRMATION' | 'BLOCKED';

@Injectable()
export class TeamService {
	constructor(
		private readonly db: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly filterService: FilterService,
	) {}

	async getUsers(actor: AuthUser, input: GetTeamUsersDto) {
		const organizationId = this.assertOrganization(actor.organizationId);
		const { skip: offset, perPage } = this.paginationService.getPagination({
			page: input.page,
			perPage: input.perPage,
		});

		const baseFilters = this.filterService.createFilter(
			input.filters,
			input.joinOperator,
			false,
		);
		const fullName = input.fullName?.trim();

		const andFilters: Record<string, unknown>[] = [
			{ organizationId },
			...((baseFilters.AND as Record<string, unknown>[]) ?? [baseFilters]),
		];

		if (fullName) {
			andFilters.push({
				fullName: {
					contains: fullName,
					mode: 'insensitive',
				},
			});
		}

		const where = {
			AND: andFilters,
		};

		const allowedSortFields = new Set([
			'fullName',
			'email',
			'role',
			'createdAt',
			'lastLoginAt',
			'deletedAt',
		]);
		const safeSort = (input.sort ?? []).filter(sort =>
			allowedSortFields.has(sort.id),
		);
		const sorts = this.filterService.getSortFilter(safeSort);
		const orderBy = sorts.length
			? sorts
			: [{ deletedAt: 'asc' as const }, { createdAt: 'desc' as const }];

		const [users, total] = await Promise.all([
			this.db.user.findMany({
				where,
				skip: offset,
				take: input.perPage,
				orderBy,
				select: {
					id: true,
					email: true,
					fullName: true,
					role: true,
					createdAt: true,
					lastLoginAt: true,
					deletedAt: true,
				},
			}),
			this.db.user.count({ where }),
		]);

		const usersWithLoad = await Promise.all(
			users.map(async user => {
				const openOrdersCount = await this.countOpenOrdersForUser(
					user.id,
					user.role,
				);
				return {
					...user,
					accountStatus: this.getAccountStatus(user),
					openOrdersCount,
					isSelf: user.id === actor.id,
				};
			}),
		);

		const pageCount = this.paginationService.getPageCount(total, perPage);

		return { data: usersWithLoad, pageCount, total };
	}

	async createUser(actor: AuthUser, dto: CreateTeamUserDto) {
		const organizationId = this.assertOrganization(actor.organizationId);
		const allowedRoles = new Set<Role>([
			Role.ADMIN,
			Role.MANAGER,
			Role.MECHANIC,
		]);
		if (!allowedRoles.has(dto.role)) {
			throw new BadRequestException('Unsupported role for team member');
		}

		const existingUser = await this.db.user.findUnique({
			where: { email: dto.email.toLowerCase() },
			select: { id: true },
		});
		if (existingUser) {
			throw new ConflictException('User with this email already exists');
		}

		const temporaryPassword = this.createTemporaryPassword();
		const hashedPassword = await hash(temporaryPassword);
		const fullName =
			dto.fullName?.trim() || this.fallbackNameFromEmail(dto.email);

		const createdUser = await this.db.user.create({
			data: {
				email: dto.email.toLowerCase(),
				fullName,
				role: dto.role,
				password: hashedPassword,
				organizationId,
			},
			select: {
				id: true,
				email: true,
				fullName: true,
				role: true,
				createdAt: true,
				lastLoginAt: true,
				deletedAt: true,
			},
		});

		return {
			...createdUser,
			accountStatus: 'PENDING_CONFIRMATION' as AccountStatus,
			temporaryPassword,
		};
	}

	async updateUser(actor: AuthUser, userId: string, dto: UpdateTeamUserDto) {
		const organizationId = this.assertOrganization(actor.organizationId);
		if (userId === actor.id) {
			throw new ForbiddenException(
				'You cannot edit your own account from team management',
			);
		}

		const user = await this.db.user.findFirst({
			where: { id: userId, organizationId },
			select: { id: true },
		});
		if (!user) {
			throw new NotFoundException('Team member not found');
		}

		if (!dto.fullName && !dto.role) {
			throw new BadRequestException('No update fields provided');
		}

		const updatedUser = await this.db.user.update({
			where: { id: userId },
			data: {
				...(dto.fullName ? { fullName: dto.fullName.trim() } : {}),
				...(dto.role ? { role: dto.role } : {}),
			},
			select: {
				id: true,
				email: true,
				fullName: true,
				role: true,
				createdAt: true,
				lastLoginAt: true,
				deletedAt: true,
			},
		});

		return {
			...updatedUser,
			accountStatus: this.getAccountStatus(updatedUser),
		};
	}

	async blockUser(actor: AuthUser, userId: string) {
		const organizationId = this.assertOrganization(actor.organizationId);
		if (userId === actor.id) {
			throw new ForbiddenException('You cannot block your own account');
		}

		const user = await this.db.user.findFirst({
			where: { id: userId, organizationId },
			select: { id: true, deletedAt: true },
		});
		if (!user) {
			throw new NotFoundException('Team member not found');
		}
		if (user.deletedAt) {
			return { id: user.id, deletedAt: user.deletedAt };
		}

		const updatedUser = await this.db.user.update({
			where: { id: userId },
			data: { deletedAt: new Date() },
			select: { id: true, deletedAt: true },
		});

		return updatedUser;
	}

	private async countOpenOrdersForUser(userId: string, role: Role) {
		const openStatuses: OrderStatus[] = [
			OrderStatus.NEW,
			OrderStatus.IN_PROGRESS,
			OrderStatus.WAITING_PARTS,
		];

		if (role === Role.MECHANIC) {
			return this.db.order.count({
				where: {
					deletedAt: null,
					status: { in: openStatuses },
					OR: [
						{ mechanicId: userId },
						{ services: { some: { mechanicId: userId } } },
					],
				},
			});
		}

		if (role === Role.MANAGER) {
			return this.db.order.count({
				where: {
					deletedAt: null,
					status: { in: openStatuses },
					managerId: userId,
				},
			});
		}

		return 0;
	}

	private getAccountStatus(user: {
		lastLoginAt: Date | null;
		deletedAt: Date | null;
	}): AccountStatus {
		if (user.deletedAt) {
			return 'BLOCKED';
		}

		if (!user.lastLoginAt) {
			return 'PENDING_CONFIRMATION';
		}

		return 'ACTIVE';
	}

	private assertOrganization(organizationId: string | null): string {
		if (!organizationId) {
			throw new ForbiddenException('Admin is not attached to organization');
		}
		return organizationId;
	}

	private createTemporaryPassword(): string {
		return `${randomBytes(9).toString('base64url')}A1`;
	}

	private fallbackNameFromEmail(email: string): string {
		return email.split('@')[0]?.trim() || 'Team Member';
	}
}
