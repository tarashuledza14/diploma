import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
	@IsString()
	id: string;
}
