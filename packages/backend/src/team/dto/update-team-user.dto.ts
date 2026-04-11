import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'prisma/generated/prisma/client';

export class UpdateTeamUserDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role;
}
