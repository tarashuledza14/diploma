import { Injectable } from '@nestjs/common';
import { Role, User } from 'prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async findByEmail(
		email: string,
		options?: { includeDeleted?: boolean },
	): Promise<User | null> {
		return this.prisma.user.findFirst({
			where: {
				email,
				...(options?.includeDeleted ? {} : { deletedAt: null }),
			},
		});
	}

	async findById(
		id: string,
		options?: { includeDeleted?: boolean },
	): Promise<User | null> {
		return this.prisma.user.findFirst({
			where: {
				id,
				...(options?.includeDeleted ? {} : { deletedAt: null }),
			},
		});
	}

	async create(data: {
		email: string;
		password: string;
		fullName: string;
		phone?: string;
		role?: Role;
		organizationId?: string | null;
	}): Promise<User> {
		return this.prisma.user.create({
			data: {
				...data,
				role: data.role || Role.MECHANIC,
			},
		});
	}

	async findAll(): Promise<User[]> {
		return this.prisma.user.findMany();
	}

	async updateLastLoginAt(id: string): Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { lastLoginAt: new Date() },
		});
	}

	async updatePassword(id: string, password: string): Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { password },
		});
	}
}
