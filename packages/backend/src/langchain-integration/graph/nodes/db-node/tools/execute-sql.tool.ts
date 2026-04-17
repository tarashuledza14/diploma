import { tool } from 'langchain';
import zod from 'zod';
import { sanitizeSqlQuery, toToolErrorMessage } from './sql-query.guard';

export const createExecuteSqlTool = (
	executeReadOnlyQuery: (query: string) => Promise<unknown>,
) => {
	return tool(
		async ({ query }: { query: string }) => {
			try {
				const q = sanitizeSqlQuery(query);
				const result = await executeReadOnlyQuery(q);
				return typeof result === 'string'
					? result
					: JSON.stringify(result ?? [], null, 2);
			} catch (e) {
				return toToolErrorMessage(e);
			}
		},
		{
			name: 'execute_sql',
			description:
				'Execute a READ-ONLY PostgreSQL SELECT query and return results.',
			schema: zod.object({
				query: zod
					.string()
					.describe('PostgreSQL SELECT query to execute (read-only).'),
			}),
		},
	);
};
