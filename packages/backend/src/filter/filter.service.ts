import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { FilterItem, JoinOperator, SortItem } from './dto/filter.dto';
import { FilterOperators } from './enums/filter.enum';

@Injectable()
export class FilterService {
	createFilter(filtersData?: FilterItem[], joinOperator?: JoinOperator) {
		let filters: Prisma.ClientWhereInput[] = [];
		for (let item of filtersData) {
			switch (item.operator) {
				case FilterOperators.CONTAINS:
					filters.push(this.getContainsFilter(item.id, item.value));
					break;
				case FilterOperators.NOT_CONTAIN:
					filters.push(this.getNotContainFilter(item.id, item.value));
					break;
				case FilterOperators.EQUALS:
					filters.push(this.getEqualsFilter(item.id, item.value));
					break;
				case FilterOperators.NOT_EQUALS:
					filters.push(this.getNotEquals(item.id, item.value));
					break;
			}
		}
		return filters.length ? { [joinOperator || 'and']: filters } : {};
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
		value: string,
	): Prisma.ClientWhereInput {
		console.log('CONTAINS');
		return {
			[field]: {
				contains: value,
				mode: 'insensitive',
			},
		};
	}
	private getNotContainFilter(
		field: string,
		value: string,
	): Prisma.ClientWhereInput {
		return {
			NOT: {
				[field]: {
					contains: value,
					mode: 'insensitive',
				},
			},
		};
	}
	private getEqualsFilter(
		field: string,
		value: string,
	): Prisma.ClientWhereInput {
		return {
			[field]: { equals: value, mode: 'insensitive' },
		};
	}
	private getNotEquals(field: string, value: string): Prisma.ClientWhereInput {
		return {
			NOT: {
				[field]: { equals: value, mode: 'insensitive' },
			},
		};
	}
}
