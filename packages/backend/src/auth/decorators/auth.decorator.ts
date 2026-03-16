import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'prisma/generated/prisma/client';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

export const Auth = (...roles: Role[]) =>
	applyDecorators(
		UseGuards(AuthGuard('jwt'), RolesGuard),
		...(roles.length ? [Roles(...roles)] : []),
	);
