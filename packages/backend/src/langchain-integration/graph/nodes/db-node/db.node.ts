import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAgent, toolCallLimitMiddleware } from 'langchain';
import { Prisma } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentState } from '../../state';
import { createCheckSqlQueryTool } from './tools/check-sql-query.tool';
import { createExecuteSqlTool } from './tools/execute-sql.tool';
import { createGetSchemaTool } from './tools/get-schema.tool';
import { createListTablesTool } from './tools/list-tables.tool';

type ColumnRow = {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
};

type TableRow = {
	table_name: string;
};

@Injectable()
export class DbNodeService {
	private model = '';
	private llm: ChatOpenAI;

	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
	) {
		this.model = this.configService.get('OPENAI_MODEL') || 'gpt-5-mini';
		this.llm = new ChatOpenAI({
			modelName: this.model,
		});
	}

	private buildSystemPrompt(organizationId: string | null): string {
		const tenantRule = organizationId
			? `- Tenant isolation: if queried table has column organization_id, always filter by organization_id = '${organizationId}'.`
			: '- Tenant isolation: organization_id is not provided, so do not invent tenant filters.';

		return `You are a careful PostgreSQL analyst for an auto service management system.

Rules:
- Think step-by-step.
- You have these tools: list_tables, get_schema, check_sql_query, execute_sql.
- Use this exact order when schema is unknown:
  1) list_tables
  2) get_schema for only relevant tables (2-4 tables)
  3) draft SQL
  4) check_sql_query
  5) execute_sql
- Never skip check_sql_query before execute_sql.
- Read-only only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
- Limit to 5 rows unless the user explicitly asks otherwise.
- Prefer solving in a single SQL query, but retry when check_sql_query or execute_sql returns Error: ...
- You may call \`execute_sql\` at most 3 times in this run.
- If all attempts fail, ask only a business clarification (period, branch, status, threshold), never a schema clarification.
- Prefer explicit column lists; avoid SELECT *.
- When joining one-to-many tables, avoid duplicate business entities in output: aggregate first (SUM/COUNT with GROUP BY) or use DISTINCT ON for PostgreSQL.
- For reorder/stock questions, PartInventory may contain multiple rows per part (batches/locations). Always aggregate quantity per part before filtering/sorting.
- Do not narrate or print raw SQL in the final reply to the user.
- Reply to the user in Ukrainian using Markdown. Do not expose raw UUIDs when names exist via JOINs.
- NEVER ask the user about technical DB internals: column names, table names, case sensitivity, SQL syntax, or schema versions.
- PostgreSQL dialect only: never use MySQL or SQLite specific syntax.
- Use exact double-quoted identifiers when needed (example: p."minStock").
- If query fails with "column does not exist" or relation errors, use tools to self-correct SQL and retry.
${tenantRule}
- CRITICAL FORMATTING RULE: For ANY list of records (clients, parts, vehicles), output a JSON array inside a markdown block with the tag \`json data-table\`.
- DO NOT use raw database column names as JSON keys. Translate keys into short, clear Ukrainian labels (e.g., use "Ім'я Клієнта" instead of "full_name", "Телефон" instead of "phone", "Дата" instead of "created_at").
	Example:
	\`\`\`json data-table
	[
		{ "Ім'я Клієнта": "Марія", "Телефон": "+380...", "Кількість авто": 1 }
	]
	\`\`\`

The maximum number of \`execute_sql\` calls per run is limited; use them efficiently.`;
	}

	private isToolLimitError(error: unknown): boolean {
		const message =
			error instanceof Error ? error.message : String(error ?? 'Unknown error');
		return /tool call limit exceeded|do not call\s+['`"]?execute_sql['`"]?/i.test(
			message,
		);
	}

	private toUserFacingDbErrorMessage(error: unknown): string {
		if (this.isToolLimitError(error)) {
			return 'Запит виявився занадто неоднозначним для безпечного автоматичного SQL-виконання за один прохід. Уточніть, будь ласка, період, організацію або ліміт рядків.';
		}

		return 'Не вдалося отримати дані з БД у цьому запиті. Уточніть, будь ласка, критерії (період, організація, статус, ліміт) і повторіть.';
	}

	async process(state: typeof AgentState.State) {
		const normalizedRole = (state.userRole ?? '').toUpperCase();
		const hasDbAccess =
			normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';
		if (!hasDbAccess) {
			throw new UnauthorizedException(
				'Access to db_node is forbidden for your role',
			);
		}

		const listTablesTool = createListTablesTool(() =>
			this.prisma.$queryRaw<TableRow[]>(Prisma.sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `),
		);

		const getSchemaTool = createGetSchemaTool(tableNames => {
			return this.prisma.$queryRaw<ColumnRow[]>(Prisma.sql`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (${Prisma.join(tableNames.map(name => Prisma.sql`${name}`))})
        ORDER BY table_name, ordinal_position
      `);
		});

		const checkSqlQueryTool = createCheckSqlQueryTool(async query => {
			await this.prisma.$queryRawUnsafe(`EXPLAIN ${query}`);
		});

		const executeSqlTool = createExecuteSqlTool(query =>
			this.prisma.$queryRawUnsafe(query),
		);

		const agent = createAgent({
			model: this.llm,
			tools: [listTablesTool, getSchemaTool, checkSqlQueryTool, executeSqlTool],
			systemPrompt: this.buildSystemPrompt(state.organizationId ?? null),
			middleware: [
				toolCallLimitMiddleware({
					runLimit: 3,
					toolName: 'execute_sql',
				}),
			],
		});

		const priorCount = state.messages.length;
		let delta: BaseMessage[];

		try {
			const result = await agent.invoke({
				messages: state.messages,
			} as Parameters<(typeof agent)['invoke']>[0]);
			delta = result.messages.slice(priorCount) as BaseMessage[];
		} catch (error) {
			delta = [new AIMessage(this.toUserFacingDbErrorMessage(error))];
		}

		return {
			messages: delta,
			next: 'supervisor',
		};
	}
}
