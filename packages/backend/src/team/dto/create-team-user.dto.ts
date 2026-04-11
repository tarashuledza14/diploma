import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';
import { Role } from 'prisma/generated/prisma/client';

export class CreateTeamUserDto {
	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string;

	@IsEnum(Role)
	role: Role;
}
