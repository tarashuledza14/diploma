import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'prisma/generated/prisma/client';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from './roles.decorator';

export const Auth = (...roles: Role[]) =>
	applyDecorators(
		UseGuards(AuthGuard('jwt'), RolesGuard),
		...(roles.length ? [Roles(...roles)] : []),
	);
