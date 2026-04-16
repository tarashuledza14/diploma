import { tool } from 'langchain';
import zod from 'zod';
import { toToolErrorMessage } from './sql-query.guard';

const SAFE_TABLE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export type SchemaColumnRow = {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
};

function normalizeTableNames(tableNames: string[]): string[] {
	const uniq = new Set<string>();

	for (const raw of tableNames) {
		const value = String(raw ?? '').trim();
		if (!value) {
			continue;
		}

		if (!SAFE_TABLE_NAME_RE.test(value)) {
			throw new Error(`Unsafe table name: ${value}`);
		}

		uniq.add(value);
	}

	if (uniq.size === 0) {
		throw new Error('Provide at least one valid table name.');
	}

	return [...uniq].slice(0, 8);
}

export const createGetSchemaTool = (
	getSchema: (tableNames: string[]) => Promise<SchemaColumnRow[]>,
) => {
	return tool(
		async ({ tableNames }: { tableNames: string[] }) => {
			try {
				const selectedTables = normalizeTableNames(tableNames);
				const rows = await getSchema(selectedTables);

				if (!rows.length) {
					return `Error: No schema found for tables: ${selectedTables.join(', ')}`;
				}

				return JSON.stringify(rows, null, 2);
			} catch (error) {
				return toToolErrorMessage(error);
			}
		},
		{
			name: 'get_schema',
			description:
				'Get columns for specific tables. Use after list_tables and only for relevant tables.',
			schema: zod.object({
				tableNames: zod
					.array(zod.string())
					.min(1)
					.max(8)
					.describe('Relevant table names from list_tables output.'),
			}),
		},
	);
};
