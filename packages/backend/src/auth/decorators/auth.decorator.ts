import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Role } from '@shared'
import { RolesGuard } from '../roles/roles.guard'

export const Auth = (role: Role = Role.CLIENT) =>
	applyDecorators(
		role === Role.ADMIN
			? UseGuards(AuthGuard('jwt'), RolesGuard) 
			: UseGuards(AuthGuard('jwt'))
	);
