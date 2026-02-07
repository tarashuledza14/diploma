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
	@IsEnum(['AND', 'OR'])
	@Transform(({ value }) => {
		return value?.toUpperCase?.() ?? value;
	})
	joinOperator?: JoinOperator = 'AND';
}

export type JoinOperator = 'AND' | 'OR';

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

export type FilterVariant = 'text' | 'number' | 'date';
export class FilterItem {
	@IsString()
	id: string;

	@IsString({ each: true })
	value: string | string[];

	@IsOptional()
	@IsString()
	operator?: FilterOperators;

	@IsString()
	variant: FilterVariant;
}
