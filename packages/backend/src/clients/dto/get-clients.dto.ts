import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';

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

export enum FilterOperators {
	CONTAINS = 'iLike',
	NOT_CONTAIN = 'notILike',
	EQUALS = 'eq',
	NOT_EQUALS = 'ne',
}

export class GetClientsDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page: number = 1;

	@IsInt()
	@Min(1)
	@Type(() => Number)
	perPage: number = 10;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SortItem)
	sort?: SortItem[] = [];

	@IsOptional()
	@IsString()
	fullName?: string;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FilterItem)
	filters?: FilterItem[] = [];

	@IsOptional()
	@IsEnum(['and', 'or'])
	joinOperator?: 'and' | 'or' = 'and';
}
