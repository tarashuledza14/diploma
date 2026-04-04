import { tool } from 'langchain';
import zod from 'zod';

const DENY_RE =
	/\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

function sanitizeSqlQuery(q: unknown): string {
	let query = String(q ?? '').trim();

	const semis = [...query].filter(c => c === ';').length;
	if (semis > 1 || (query.endsWith(';') && query.slice(0, -1).includes(';'))) {
		throw new Error('Multiple statements are not allowed.');
	}

	query = query.replace(/;+\s*$/g, '').trim();

	if (!query.toLowerCase().startsWith('select')) {
		throw new Error('Only SELECT statements are allowed.');
	}

	if (DENY_RE.test(query)) {
		throw new Error('DML/DDL detected. Only read-only queries are permitted.');
	}

	if (!HAS_LIMIT_TAIL_RE.test(query)) {
		query += ' LIMIT 5';
	}

	return query;
}

export const createExecuteSqlTool = (
	executeReadOnlyQuery: (query: string) => Promise<unknown>,
) => {
	return tool(
		async ({ query }: { query: string }) => {
			const q = sanitizeSqlQuery(query);
			try {
				const result = await executeReadOnlyQuery(q);
				return typeof result === 'string'
					? result
					: JSON.stringify(result ?? [], null, 2);
			} catch (e) {
				throw new Error(
					e instanceof Error ? e.message : String(e ?? 'Unknown error'),
				);
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
