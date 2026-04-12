import { IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
	@IsString()
	@MinLength(20)
	token: string;

	@IsString()
	@MinLength(8, {
		message: 'Password must be at least 8 symbols long',
	})
	password: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	fullName?: string;
}
