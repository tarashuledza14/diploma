import { BaseMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { createAgent, toolCallLimitMiddleware } from 'langchain';
import * as path from 'path';
import { Prisma } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentState } from '../../state';
import { createExecuteSqlTool } from './tools/execute-sql.tool';

type ColumnRow = {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
};

@Injectable()
export class DbNodeService implements OnModuleInit {
	private model = '';
	private llm: ChatOpenAI;
	private authoritativeSchema = '';

	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
	) {
		this.model = this.configService.get('OPENAI_MODEL') || 'gpt-5-mini';
		this.llm = new ChatOpenAI({
			modelName: this.model,
		});
	}

	async onModuleInit() {
		await this.loadAuthoritativeSchema();
	}

	private formatColumnsAsSchema(rows: ColumnRow[]): string {
		const byTable = new Map<string, ColumnRow[]>();
		for (const row of rows) {
			const list = byTable.get(row.table_name) ?? [];
			list.push(row);
			byTable.set(row.table_name, list);
		}

		const parts: string[] = [];
		for (const [table, cols] of [...byTable.entries()].sort((a, b) =>
			a[0].localeCompare(b[0]),
		)) {
			const lines = cols.map(
				c =>
					`  - ${c.column_name}: ${c.data_type}${c.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}`,
			);
			parts.push(`Table "${table}":\n${lines.join('\n')}`);
		}
		return parts.join('\n\n');
	}

	private loadSchemaFromPrismaFile(): string {
		const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
		const rawSchema = fs.readFileSync(schemaPath, 'utf-8');
		return rawSchema
			.replace(/generator[\s\S]*?}/g, '')
			.replace(/datasource[\s\S]*?}/g, '')
			.trim();
	}

	private async loadAuthoritativeSchema() {
		try {
			const rows = await this.prisma.$queryRaw<ColumnRow[]>(Prisma.sql`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);
			this.authoritativeSchema = this.formatColumnsAsSchema(rows);
			console.log('Database schema (information_schema) loaded for SQL agent.');
		} catch (error) {
			console.error(
				'Failed to load schema from DB; falling back to prisma/schema.prisma:',
				error,
			);
			try {
				this.authoritativeSchema = this.loadSchemaFromPrismaFile();
				console.log('Prisma schema file loaded as fallback for SQL agent.');
			} catch (e) {
				console.error('Failed to read prisma/schema.prisma:', e);
				this.authoritativeSchema = '(schema unavailable)';
			}
		}
	}

	private buildSystemPrompt(): string {
		return `You are a careful PostgreSQL analyst for an auto service management system.

Authoritative schema (do not invent columns/tables):
${this.authoritativeSchema}

Rules:
- Think step-by-step.
- When you need data, call the tool \`execute_sql\` with ONE SELECT query.
- Read-only only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
- Limit to 5 rows unless the user explicitly asks otherwise.
- If the tool fails or returns an error, revise the SQL and try again.
- Prefer explicit column lists; avoid SELECT *.
- Do not narrate or print raw SQL in the final reply to the user.
- Reply to the user in Ukrainian using Markdown. Do not expose raw UUIDs when names exist via JOINs.
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

	async process(state: typeof AgentState.State) {
		const executeSqlTool = createExecuteSqlTool(query =>
			this.prisma.$queryRawUnsafe(query),
		);

		const agent = createAgent({
			model: this.llm,
			tools: [executeSqlTool],
			systemPrompt: this.buildSystemPrompt(),
			middleware: [
				toolCallLimitMiddleware({
					runLimit: 5,
					toolName: 'execute_sql',
				}),
			],
		});

		const priorCount = state.messages.length;
		const result = await agent.invoke({
			messages: state.messages,
		} as Parameters<(typeof agent)['invoke']>[0]);
		const delta = result.messages.slice(priorCount) as BaseMessage[];

		return {
			messages: delta,
			next: 'supervisor',
		};
	}
}
