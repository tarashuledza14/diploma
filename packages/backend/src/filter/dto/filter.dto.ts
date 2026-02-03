import { IntersectionType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { FilterOperators } from '../enums/filter.enum';

export class FilterDto {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FilterItem)
	filters?: FilterItem[] = [];

	@IsOptional()
	@IsEnum(['and', 'or'])
	joinOperator?: JoinOperator = 'and';
}

export type JoinOperator = 'and' | 'or';

export class SortDto {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SortItem)
	sort?: SortItem[] = [];
}

export class CombinedFilterAndPagination extends IntersectionType(
	PaginationDto,
	FilterDto,
	SortDto,
) {}
export class SortItem {
	@IsString()
	id: string;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => {
		if (value === 'true') return true;
		if (value === 'false') return false;
		return value;
	})
	desc?: boolean;
}

export class FilterItem {
	@IsString()
	id: string;

	@Transform(({ value }) => {
		const num = Number(value);
		if (
			!isNaN(num) &&
			typeof value !== 'boolean' &&
			value !== null &&
			value !== ''
		) {
			return num;
		}
		return value;
	})
	value: any;

	@IsOptional()
	@IsString()
	operator?: FilterOperators;
}
