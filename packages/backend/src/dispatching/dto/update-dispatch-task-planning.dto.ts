import {
	IsDateString,
	IsNumber,
	IsOptional,
	Min,
	ValidateIf,
} from 'class-validator';

export class UpdateDispatchTaskPlanningDto {
	@IsOptional()
	@IsNumber()
	@Min(0)
	additionalHours?: number;

	@IsOptional()
	@ValidateIf((_, value) => value !== null)
	@IsDateString()
	deadline?: string | null;
}
