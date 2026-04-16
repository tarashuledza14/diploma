const DENY_RE =
	/\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE|GRANT|REVOKE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

export function sanitizeSqlQuery(q: unknown, defaultLimit = 5): string {
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
		query += ` LIMIT ${defaultLimit}`;
	}

	return query;
}

export function toToolErrorMessage(error: unknown): string {
	const message =
		error instanceof Error ? error.message : String(error ?? 'Unknown error');
	return `Error: ${message}`;
}
