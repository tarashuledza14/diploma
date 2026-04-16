import { tool } from 'langchain';
import zod from 'zod';
import { sanitizeSqlQuery, toToolErrorMessage } from './sql-query.guard';

export const createCheckSqlQueryTool = (
	validateQuerySyntax: (query: string) => Promise<void>,
) => {
	return tool(
		async ({ query }: { query: string }) => {
			try {
				const normalizedQuery = sanitizeSqlQuery(query);
				await validateQuerySyntax(normalizedQuery);

				return [
					'OK: Query is valid for PostgreSQL and safe to run.',
					`Normalized query: ${normalizedQuery}`,
				].join('\n');
			} catch (error) {
				return toToolErrorMessage(error);
			}
		},
		{
			name: 'check_sql_query',
			description:
				'Validate PostgreSQL SELECT query syntax before execute_sql. Returns error text instead of throwing.',
			schema: zod.object({
				query: zod.string().describe('Candidate PostgreSQL SELECT query.'),
			}),
		},
	);
};
