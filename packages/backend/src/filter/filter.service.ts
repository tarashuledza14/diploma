import { BadRequestException, Injectable } from '@nestjs/common';
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
	createFilter(
		filtersData?: FilterItem[],
		joinOperator?: JoinOperator,
	): Record<string, any> {
		const deletedAtFilter = { deletedAt: null };

		if (!filtersData || filtersData.length === 0) {
			return { AND: [deletedAtFilter] };
		}

		const otherFilters: Record<string, any>[] = [];
		for (const item of filtersData) {
			const value = this.convertValue(item.value, item.variant);
			switch (item.operator) {
				case FilterOperators.CONTAINS:
					otherFilters.push(
						this.getContainsFilter(item.id, value, item.variant),
					);
					break;
				case FilterOperators.NOT_CONTAIN:
					otherFilters.push(
						this.getNotContainFilter(item.id, value, item.variant),
					);
					break;
				case FilterOperators.EQUALS:
					otherFilters.push(this.getEqualsFilter(item.id, value, item.variant));
					break;
				case FilterOperators.NOT_EQUALS:
					otherFilters.push(this.getNotEquals(item.id, value, item.variant));
					break;
				case FilterOperators.IS_BETWEEN:
					otherFilters.push(this.getIsBetween(item.id, value));
					break;
				default:
					otherFilters.push(
						this.generateOperatorFilter(
							item.id,
							item.operator,
							value,
							item.variant,
						),
					);
			}
		}

		if (otherFilters.length === 0) {
			return { AND: [deletedAtFilter] };
		}

		if ((joinOperator || 'AND') === 'OR') {
			return {
				AND: [deletedAtFilter, { OR: otherFilters }],
			};
		} else {
			return {
				AND: [deletedAtFilter, ...otherFilters],
			};
		}
	}

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

	getSortFilter(sort: SortItem[]): Record<string, 'asc' | 'desc'>[] {
		if (!sort || sort.length === 0) {
			return [{ createdAt: 'desc' }];
		}

		return sort.map(sortItem => {
			const direction = sortItem.desc ? 'desc' : 'asc';
			const keys = sortItem.id.split('.');
			if (keys.length > 1) {
				return this.buildNestedSortObject(keys, direction);
			}
			return { [sortItem.id]: direction };
		});
	}

	private buildNestedSortObject(keys: string[], direction: 'asc' | 'desc') {
		let obj: any = {};
		let current = obj;
		for (let i = 0; i < keys.length - 1; i++) {
			current[keys[i]] = {};
			current = current[keys[i]];
		}
		current[keys[keys.length - 1]] = direction;
		return obj;
	}

	// --- НОВИЙ МЕТОД ДЛЯ ФІЛЬТРАЦІЇ ---
	// Створює вкладену структуру для фільтрів, наприклад:
	// field: "category.name", rule: { contains: "foo" }
	// перетворює на: { category: { name: { contains: "foo" } } }
	private buildNestedFilter(
		field: string,
		rule: Record<string, any>,
	): Record<string, any> {
		const keys = field.split('.');

		// Якщо вкладеності немає, повертаємо простий об'єкт
		if (keys.length === 1) {
			return { [field]: rule };
		}

		const root: any = {};
		let current = root;

		// Проходимо по ключах до передостаннього
		for (let i = 0; i < keys.length - 1; i++) {
			current[keys[i]] = {};
			current = current[keys[i]];
		}

		// Присвоюємо правило останньому ключу
		current[keys[keys.length - 1]] = rule;

		return root;
	}

	private getContainsFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Record<string, any> {
		const filter: Record<string, unknown> = { contains: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';

		// Використовуємо новий білдер
		return this.buildNestedFilter(field, filter);
	}

	private getNotContainFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Record<string, any> {
		const filter: Record<string, unknown> = { contains: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';

		// NOT обгортає вже побудовану вкладену структуру
		return { NOT: this.buildNestedFilter(field, filter) };
	}

	private getEqualsFilter(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Record<string, any> {
		if (variant === 'date') {
			return this.getDateRangeFilter(field, value, false);
		}
		const filter: Record<string, unknown> = { equals: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';

		return this.buildNestedFilter(field, filter);
	}

	private getNotEquals(
		field: string,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Record<string, any> {
		if (variant === 'date') {
			return this.getDateRangeFilter(field, value, true);
		}
		const filter: Record<string, unknown> = { equals: value };
		if (this.isTextVariant(variant)) filter.mode = 'insensitive';

		return { NOT: this.buildNestedFilter(field, filter) };
	}

	private getDateRangeFilter(
		field: string,
		value: FilterValue,
		not: boolean = false,
	): Record<string, any> {
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

		const year = dateObj.getFullYear();
		const month = dateObj.getMonth();
		const day = dateObj.getDate();

		const start = new Date(year, month, day, 0, 0, 0, 0);
		const end = new Date(year, month, day, 23, 59, 59, 999);

		const range = { gte: start, lte: end };

		// Будуємо вкладеність для діапазону
		const filterObject = this.buildNestedFilter(field, range);

		if (not) {
			return { NOT: filterObject };
		}
		return filterObject;
	}

	private generateOperatorFilter(
		field: string,
		operator: FilterOperators,
		value: FilterValue,
		variant: FilterVariant = 'text',
	): Record<string, any> {
		const condition = Object.values(FilterOperators).includes(operator);
		if (!condition) {
			throw new BadRequestException(`Unsupported filter operator: ${operator}`);
		}

		if (variant === 'date' && value instanceof Date) {
			const year = value.getFullYear();
			const month = value.getMonth();
			const day = value.getDate();

			if (operator === FilterOperators.GREATER_THAN_OR_EQUALS) {
				value = new Date(year, month, day, 0, 0, 0, 0);
			} else if (operator === FilterOperators.GREATER_THAN) {
				value = new Date(year, month, day + 1, 0, 0, 0, 0);
			} else if (operator === FilterOperators.LESS_THAN_OR_EQUALS) {
				value = new Date(year, month, day, 23, 59, 59, 999);
			} else if (operator === FilterOperators.LESS_THAN) {
				value = new Date(year, month, day, 0, 0, 0, 0);
			}
		}

		return this.buildNestedFilter(field, { [operator]: value });
	}

	private getIsBetween(field: string, value: FilterValue): Record<string, any> {
		const rule = {
			lte: Array.isArray(value) ? Number(value[1]) : Number(value),
			gte: Array.isArray(value) ? Number(value[0]) : Number(value),
		};

		return this.buildNestedFilter(field, rule);
	}
}
