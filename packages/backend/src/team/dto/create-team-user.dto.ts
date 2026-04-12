import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';
import { InviteLanguage, Role } from 'prisma/generated/prisma/client';

export class CreateTeamUserDto {
	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string;

	@IsEnum(Role)
	role: Role;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.trim().toUpperCase() : value,
	)
	@IsEnum(InviteLanguage)
	language?: InviteLanguage;
}
