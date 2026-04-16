import { Document } from '@langchain/core/documents';
import { BaseStore } from '@langchain/core/stores';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ManualOriginalDocstoreService extends BaseStore<string, Document> {
	lc_namespace = ['langchain', 'storage', 'manual_original_chunks'];

	constructor(private readonly prismaService: PrismaService) {
		super();
	}

	async mget(keys: string[]): Promise<(Document | undefined)[]> {
		if (keys.length === 0) {
			return [];
		}

		const rows = await this.prismaService.manualOriginalChunk.findMany({
			where: {
				docId: {
					in: keys,
				},
			},
		});
		const rowsByDocId = new Map(rows.map(row => [row.docId, row]));

		return keys.map(docId => {
			const row = rowsByDocId.get(docId);
			if (!row) {
				return undefined;
			}

			return new Document({
				pageContent: row.pageContent,
				metadata: this.ensureMetadataObject(row.metadata),
			});
		});
	}

	async mset(keyValuePairs: [string, Document][]): Promise<void> {
		if (keyValuePairs.length === 0) {
			return;
		}

		const dedupedPairs = new Map<string, Document>();
		for (const [docId, doc] of keyValuePairs) {
			dedupedPairs.set(docId, doc);
		}

		const pairs = Array.from(dedupedPairs.entries());
		const docIds = pairs.map(([docId]) => docId);
		const rows = pairs.map(([docId, doc]) => this.toDatabaseRow(docId, doc));

		await this.prismaService.$transaction([
			this.prismaService.manualOriginalChunk.deleteMany({
				where: {
					docId: {
						in: docIds,
					},
				},
			}),
			this.prismaService.manualOriginalChunk.createMany({
				data: rows as any,
			}),
		]);
	}

	async mdelete(keys: string[]): Promise<void> {
		if (keys.length === 0) {
			return;
		}

		await this.prismaService.manualOriginalChunk.deleteMany({
			where: {
				docId: {
					in: keys,
				},
			},
		});
	}

	async *yieldKeys(prefix?: string): AsyncGenerator<string> {
		let cursorId: string | undefined;

		while (true) {
			const rows = await this.prismaService.manualOriginalChunk.findMany({
				where: prefix
					? {
							docId: {
								startsWith: prefix,
							},
						}
					: undefined,
				select: {
					id: true,
					docId: true,
				},
				orderBy: {
					id: 'asc',
				},
				take: 500,
				...(cursorId
					? {
							cursor: {
								id: cursorId,
							},
							skip: 1,
						}
					: {}),
			});

			if (rows.length === 0) {
				return;
			}

			for (const row of rows) {
				yield row.docId;
			}

			cursorId = rows[rows.length - 1].id;
		}
	}

	async deleteByVectorRef(vectorRef: string): Promise<number> {
		if (!vectorRef) {
			return 0;
		}

		const result = await this.prismaService.manualOriginalChunk.deleteMany({
			where: {
				vectorRef,
			},
		});

		return result.count;
	}

	private toDatabaseRow(docId: string, doc: Document) {
		const metadata = this.ensureMetadataObject(doc.metadata);
		const vectorRefFromMetadata =
			typeof metadata.vectorRef === 'string' ? metadata.vectorRef : null;
		const vectorRefFromDocId = this.extractVectorRefFromDocId(docId);
		const vectorRef = vectorRefFromMetadata || vectorRefFromDocId;

		if (!vectorRef) {
			throw new Error(
				`Cannot persist manual chunk ${docId}: vectorRef is missing in metadata and doc_id format.`,
			);
		}

		return {
			docId,
			vectorRef,
			pageContent: doc.pageContent,
			metadata: this.toInputJsonValue(metadata),
			organizationId:
				typeof metadata.organizationId === 'string'
					? metadata.organizationId
					: null,
			source: typeof metadata.source === 'string' ? metadata.source : null,
		};
	}

	private toInputJsonValue(value: Record<string, unknown>) {
		return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
	}

	private extractVectorRefFromDocId(docId: string) {
		const match = /^manual:([^:]+):/.exec(docId);
		return match?.[1] || null;
	}

	private ensureMetadataObject(value: unknown): Record<string, unknown> {
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			return value as Record<string, unknown>;
		}

		return {};
	}
}
