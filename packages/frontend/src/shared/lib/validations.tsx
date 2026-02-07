import {
	getFiltersStateParser,
	getSortingStateParser,
} from '@/shared/lib/parsers';
import { CommandIcon, FileSpreadsheetIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';
import { Client } from '../../../modules/clients/interfaces/client.interface';

export type FlagConfig = typeof flagConfig;

export const flagConfig = {
	featureFlags: [
		{
			label: 'Advanced filters',
			value: 'advancedFilters' as const,
			icon: FileSpreadsheetIcon,
			tooltipTitle: 'Advanced filters',
			tooltipDescription: 'Airtable like advanced filters for filtering rows.',
		},
		{
			label: 'Command filters',
			value: 'commandFilters' as const,
			icon: CommandIcon,
			tooltipTitle: 'Command filter chips',
			tooltipDescription: 'Linear like command palette for filtering rows.',
		},
	],
};
export const searchParamsParsers = {
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(10),
	sort: getSortingStateParser<Client>().withDefault([
		{ id: 'createdAt', desc: true },
	]),
	fullName: parseAsString.withDefault(''),
	email: parseAsString.withDefault(''),
	phone: parseAsString.withDefault(''),
	// advanced filter
	filters: getFiltersStateParser<Client>().withDefault([]),
	joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};
