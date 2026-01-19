import { Injectable } from '@nestjs/common'
import type { User } from '@shared'
import { Role } from '@shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles?: Role[];
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        roles: data.roles || [Role.CLIENT],
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
