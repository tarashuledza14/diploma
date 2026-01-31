import { Injectable } from '@nestjs/common';
import { Role, User } from 'prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}

	async findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id },
		});
	}

	async create(data: {
		email: string;
		password: string;
		fullName: string;
		phone?: string;
		role?: Role;
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
}
