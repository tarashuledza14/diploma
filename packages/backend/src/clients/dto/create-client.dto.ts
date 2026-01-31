import { IsString } from 'class-validator';

export class CreateClientDto {
	@IsString()
	fullName: string;
	@IsString()
	phone: string;
	@IsString()
	email?: string;
}
