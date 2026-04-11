import { IsOptional, IsString } from 'class-validator';

export class AssignDispatchTaskDto {
	@IsOptional()
	@IsString()
	mechanicId?: string | null;
}
