import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Currency } from 'prisma/generated/prisma/client';

export class UpdateAppBrandingDto {
	@IsString()
	@MinLength(1)
	@MaxLength(80)
	appName: string;

	@IsEnum(Currency)
	currency: Currency;
}
