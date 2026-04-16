import { tool } from 'langchain';
import zod from 'zod';
import { toToolErrorMessage } from './sql-query.guard';

type TableRow = {
	table_name: string;
};

export const createListTablesTool = (listTables: () => Promise<TableRow[]>) => {
	return tool(
		async () => {
			try {
				const rows = await listTables();
				const tableNames = rows.map(row => row.table_name).sort();
				return JSON.stringify(tableNames, null, 2);
			} catch (error) {
				return toToolErrorMessage(error);
			}
		},
		{
			name: 'list_tables',
			description:
				'List available PostgreSQL tables in public schema. Use this before requesting detailed schema.',
			schema: zod.object({}),
		},
	);
};
