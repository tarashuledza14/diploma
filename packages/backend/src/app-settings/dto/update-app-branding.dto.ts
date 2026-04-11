import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAppBrandingDto {
	@IsString()
	@MinLength(1)
	@MaxLength(80)
	appName: string;
}
