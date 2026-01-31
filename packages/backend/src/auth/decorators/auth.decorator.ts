import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'prisma/generated/prisma/enums';
import { RolesGuard } from '../roles/roles.guard';

export const Auth = (role: Role = Role.MECHANIC) =>
	applyDecorators(
		role === Role.ADMIN
			? UseGuards(AuthGuard('jwt'), RolesGuard)
			: UseGuards(AuthGuard('jwt')),
	);
