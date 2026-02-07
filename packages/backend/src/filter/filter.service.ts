import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import {
	FilterItem,
	FilterVariant,
	JoinOperator,
	SortItem,
} from './dto/filter.dto';
import { FilterOperators } from './enums/filter.enum';
import { FilterValue } from './types/filter.types';

@Injectable()
export class FilterService {
	createFilter(filtersData?: FilterItem[], joinOperator?: JoinOperator) {
		let filters: Prisma.ClientWhereInput[] = [{ deletedAt: null }];
		console.log('filtersData', filtersData);
		for (let item of filtersData) {
			const value = this.convertValue(item.value, item.variant);
			switch (item.operator) {
				case FilterOperators.CONTAINS:
					filters.push(this.getContainsFilter(item.id, value, item.variant));
					break;
				case FilterOperators.NOT_CONTAIN:
					filters.push(this.getNotContainFilter(item.id, value, item.variant));
					break;
				case FilterOperators.EQUALS:
					filters.push(this.getEqualsFilter(item.id, value, item.variant));
					break;
				case FilterOperators.NOT_EQUALS:
					filters.push(this.getNotEquals(item.id, value, item.variant));
					break;
				case FilterOperators.IS_BETWEEN:
					filters.push(this.getIsBetween(item.id, value));
					break;
				default:
					filters.push(
						this.generateOperatorFilter(
							item.id,
							item.operator,
							value,
							item.variant,
						),
					);
			}
		}
		console.log('filters', filters);
		return filters.length ? { [joinOperator || 'AND']: filters } : {};
	}
	// Helper to determine if a field is text (for mode: 'insensitive')
	private isTextVariant(variant: FilterVariant) {
		return variant === 'text';
	}

	convertValue(value: string | string[], variant: FilterVariant) {
		switch (variant) {
			case 'number':
				return Number(value);
			case 'date':
				const dateString = Array.isArray(value) ? value[0] : value;
				return new Date(+dateString);
			default:
				return value;
		}
	}

	getSortFilter(sort: SortItem[]): Prisma.ClientOrderByWithRelationInput[] {
		if (!sort || sort.length === 0) {
			return [{ createdAt: 'desc' }];
		}

		const validClientFields = Object.values(
			Prisma.ClientScalarFieldEnum,
		) as string[];

		return sort.map(sortItem => {
			const direction = sortItem.desc ? 'desc' : 'asc';

			if (validClientFields.includes(sortItem.id)) {
				return { [sortItem.id]: direction };
			}

			return { createdAt: 'desc' };
		});
	}

	private getContainsFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Prisma.ClientWhereInput {
		const filter: Record<string, unknown> = { contains: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';
		return {
			[field]: filter,
		};
	}
	private getNotContainFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Prisma.ClientWhereInput {
		const filter: Record<string, unknown> = { contains: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';
		return {
			NOT: {
				[field]: filter,
			},
		};
	}
	private getEqualsFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Prisma.ClientWhereInput {
		if (variant === 'date') {
			return this.getDateRangeFilter(field, value, false);
		}
		const filter: Record<string, unknown> = { equals: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';
		return {
			[field]: filter,
		};
	}
	private getNotEquals(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Prisma.ClientWhereInput {
		if (variant === 'date') {
			return this.getDateRangeFilter(field, value, true);
		}
		const filter: Record<string, unknown> = { equals: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';
		return {
			NOT: {
				[field]: filter,
			},
		};
	}
	// Діапазон для дати (eq/not eq)
	private getDateRangeFilter(
		field: string,
		value: FilterValue,
		not: boolean = false,
	): Prisma.ClientWhereInput {
		console.log('getDateRangeFilter input:', {
			field,
			value,
			type: typeof value,
		});

		let dateObj: Date | null = null;
		if (value instanceof Date) {
			dateObj = value;
		} else if (typeof value === 'string') {
			if (/^\d+$/.test(value)) {
				dateObj = new Date(Number(value));
			} else {
				dateObj = new Date(value);
			}
		}
		if (!dateObj || isNaN(dateObj.getTime())) {
			throw new BadRequestException('Invalid date value for filter');
		}

		console.log('Parsed dateObj:', dateObj, 'ISO:', dateObj.toISOString());

		// Створюємо початок і кінець дня для обраної дати
		const year = dateObj.getFullYear();
		const month = dateObj.getMonth();
		const day = dateObj.getDate();

		const start = new Date(year, month, day, 0, 0, 0, 0);
		const end = new Date(year, month, day, 23, 59, 59, 999);

		console.log('Date range:', {
			start: start.toISOString(),
			end: end.toISOString(),
		});

		const range = {
			gte: start,
			lte: end,
		};
		if (not) {
			return {
				NOT: {
					[field]: range,
				},
			};
		}
		return {
			[field]: range,
		};
	}
	private generateOperatorFilter(
		field: string,
		operator: FilterOperators,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Prisma.ClientWhereInput {
		const condition = Object.values(FilterOperators).includes(operator);
		if (!condition) {
			throw new BadRequestException(`Unsupported filter operator: ${operator}`);
		}

		if (variant === 'date' && value instanceof Date) {
			const year = value.getFullYear();
			const month = value.getMonth();
			const day = value.getDate();

			if (operator === FilterOperators.GREATER_THAN_OR_EQUALS) {
				// gte: з початку обраного дня
				value = new Date(year, month, day, 0, 0, 0, 0);
			} else if (operator === FilterOperators.GREATER_THAN) {
				// gt: з початку наступного дня (більше, без дорівнює)
				value = new Date(year, month, day + 1, 0, 0, 0, 0);
			} else if (operator === FilterOperators.LESS_THAN_OR_EQUALS) {
				// lte: до кінця обраного дня
				value = new Date(year, month, day, 23, 59, 59, 999);
			} else if (operator === FilterOperators.LESS_THAN) {
				// lt: до початку обраного дня (менше, без дорівнює)
				value = new Date(year, month, day, 0, 0, 0, 0);
			}
		}

		return {
			[field]: { [operator]: value },
		};
	}
	private getIsBetween(
		field: string,
		value: FilterValue,
	): Prisma.ClientWhereInput {
		return {
			[field]: {
				lte: Array.isArray(value) ? Number(value[1]) : Number(value),
				gte: Array.isArray(value) ? Number(value[0]) : Number(value),
			},
		};
	}
}
