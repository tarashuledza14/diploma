import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jsonrepair } from 'jsonrepair';
import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';
import z from 'zod';

const tocRangeSchema = z.object({
	start: z.number(),
	end: z.number(),
});

const tocAnalysisStructuredSchema = z.object({
	ranges: z.array(tocRangeSchema).default([]),
	reasoning: z.string().default(''),
	pageNumberBasis: z.enum(['printed', 'pdf']).default('printed'),
});

const tocAnalysisFallbackSchema = z.object({
	ranges: z
		.array(z.union([tocRangeSchema, z.tuple([z.number(), z.number()])]))
		.default([]),
	reasoning: z.string().default(''),
	pageNumberBasis: z.enum(['printed', 'pdf']).default('printed'),
});

type TocAnalysisResult = {
	ranges: Array<[number, number]>;
	reasoning: string;
	pageNumberBasis: 'printed' | 'pdf';
};

type SmartFilterConfig = {
	enabled: boolean;
	tocScanPages: number;
	safeFallbackMode: 'full' | 'tail';
	safeTailPages: number;
};

export interface SmartPdfProcessingResult {
	filteredBuffer: Buffer;
	originalPages: number;
	filteredPages: number;
	reductionPercent: number;
	ranges: Array<[number, number]>;
	reasoning: string;
	mode: 'toc' | 'safe';
}

@Injectable()
export class SmartPdfService {
	private readonly logger = new Logger(SmartPdfService.name);
	private readonly llm = new ChatOpenAI({
		modelName: 'gpt-4o-mini',
		temperature: 0,
	});

	constructor(private readonly configService: ConfigService) {}

	async processSmartPdf(fileBuffer: Buffer): Promise<SmartPdfProcessingResult> {
		const sanitizedInputBuffer = await this.sanitizePdfBuffer(fileBuffer);
		const originalPdf = await PDFDocument.load(sanitizedInputBuffer);
		const originalPages = originalPdf.getPageCount();
		const smartFilterConfig = this.resolveSmartFilterConfig();

		if (originalPages === 0) {
			return {
				filteredBuffer: sanitizedInputBuffer,
				originalPages: 0,
				filteredPages: 0,
				reductionPercent: 0,
				ranges: [],
				reasoning: 'Input PDF has no pages.',
				mode: 'safe',
			};
		}

		if (!smartFilterConfig.enabled) {
			const fullRanges: Array<[number, number]> = [[1, originalPages]];
			const filteredBuffer = await this.cropPdfByRanges(
				sanitizedInputBuffer,
				fullRanges,
			);

			return {
				filteredBuffer,
				originalPages,
				filteredPages: originalPages,
				reductionPercent: 0,
				ranges: fullRanges,
				reasoning:
					'Smart filter disabled via configuration; full manual is kept.',
				mode: 'safe',
			};
		}

		try {
			const tocPageEnd = Math.min(
				smartFilterConfig.tocScanPages,
				originalPages,
			);
			const tocBuffer = await this.cropPdfByRanges(sanitizedInputBuffer, [
				[1, tocPageEnd],
			]);
			const tocText = await this.extractTextFromPdf(tocBuffer);

			if (!tocText.trim()) {
				throw new Error('Empty ToC text extracted from first pages');
			}

			const llmResult = await this.analyzeTableOfContents(
				tocText,
				originalPages,
			);
			const offsetEstimation = this.estimatePdfPageOffsetFromTocText(
				tocText,
				originalPages,
			);
			const shouldApplyOffset =
				llmResult.pageNumberBasis !== 'pdf' &&
				offsetEstimation.confidence >= 2 &&
				offsetEstimation.offset !== 0;

			if (shouldApplyOffset) {
				this.logger.log(
					`Applying ToC page offset correction: offset=${offsetEstimation.offset}, confidence=${offsetEstimation.confidence}, basis=${llmResult.pageNumberBasis}.`,
				);
			}

			const rangesBeforeNormalization = shouldApplyOffset
				? this.applyPageOffsetToRanges(
						llmResult.ranges,
						offsetEstimation.offset,
					)
				: llmResult.ranges;
			const llmRanges = this.normalizeRanges(
				rangesBeforeNormalization,
				originalPages,
			);
			const normalizedRanges = llmRanges;

			if (normalizedRanges.length === 0) {
				throw new Error('LLM returned empty or invalid ranges');
			}

			const filteredBuffer = await this.cropPdfByRanges(
				sanitizedInputBuffer,
				normalizedRanges,
			);
			const filteredPages = await this.getPageCount(filteredBuffer);

			return {
				filteredBuffer,
				originalPages,
				filteredPages,
				reductionPercent: this.calculateReductionPercent(
					originalPages,
					filteredPages,
				),
				ranges: normalizedRanges,
				reasoning: this.buildTocReasoning(
					llmResult.reasoning,
					llmResult.pageNumberBasis,
					shouldApplyOffset,
					offsetEstimation.offset,
				),
				mode: 'toc',
			};
		} catch (error) {
			this.logger.warn(
				`ToC analysis failed, switching to safe mode. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);

			const safeRanges = this.buildSafeFallbackRanges(
				originalPages,
				smartFilterConfig,
			);
			const filteredBuffer = await this.cropPdfByRanges(
				sanitizedInputBuffer,
				safeRanges,
			);
			const filteredPages = await this.getPageCount(filteredBuffer);

			return {
				filteredBuffer,
				originalPages,
				filteredPages,
				reductionPercent: this.calculateReductionPercent(
					originalPages,
					filteredPages,
				),
				ranges: safeRanges,
				reasoning: this.buildSafeFallbackReasoning(smartFilterConfig),
				mode: 'safe',
			};
		}
	}

	private async analyzeTableOfContents(
		tocText: string,
		totalPages: number,
	): Promise<TocAnalysisResult> {
		const messages = [
			{
				role: 'system',
				content:
					'You are a car manual ToC analyzer. Select broad, user-facing sections that matter for retrieval, including (but not limited to): safety and restraint systems, cockpit and controls, comfort/interior, infotainment/connectivity (Bluetooth/CarPlay/Android Auto/navigation), driver assistance systems, operating instructions, maintenance/service, tires/wheels, emergency procedures, warning indicators, and technical specifications. Exclude only obvious noise such as prefaces, legal boilerplate, blank pages, and indexes. Return ONLY a JSON object: { "ranges": [{"start": number, "end": number}], "reasoning": "string", "pageNumberBasis": "printed|pdf" }. Use "printed" when ranges come from printed page numbers in ToC. Use "pdf" when ranges are absolute PDF page numbers (1-based, including cover/front matter pages).',
			},
			{
				role: 'user',
				content: `Table of Contents text (first pages) from a car manual. Total pages: ${totalPages}.\n\n${tocText.slice(0, 24000)}`,
			},
		];

		try {
			const structuredLlm = this.llm.withStructuredOutput(
				tocAnalysisStructuredSchema,
			);
			const parsed = await structuredLlm.invoke(messages);

			return {
				ranges: this.normalizeTocRanges(parsed.ranges),
				reasoning: parsed.reasoning,
				pageNumberBasis: parsed.pageNumberBasis,
			};
		} catch (structuredError) {
			this.logger.warn(
				`Structured ToC output failed, falling back to JSON extraction: ${this.formatError(structuredError)}`,
			);
		}

		const response = await this.llm.invoke(messages);

		const rawText = this.extractTextContent(response.content);
		const jsonPayload = this.extractFirstJsonObject(rawText);
		const parsed = tocAnalysisFallbackSchema.safeParse(
			JSON.parse(jsonrepair(jsonPayload)),
		);

		if (!parsed.success) {
			throw new Error(`Invalid ToC JSON format: ${parsed.error.message}`);
		}

		return {
			ranges: this.normalizeTocRanges(parsed.data.ranges),
			reasoning: parsed.data.reasoning,
			pageNumberBasis: parsed.data.pageNumberBasis,
		};
	}

	private normalizeTocRanges(ranges: unknown[]): Array<[number, number]> {
		const normalized: Array<[number, number]> = [];

		for (const range of ranges) {
			if (Array.isArray(range)) {
				if (range.length < 2) {
					continue;
				}

				const start = Number(range[0]);
				const end = Number(range[1]);
				if (Number.isFinite(start) && Number.isFinite(end)) {
					normalized.push([start, end]);
				}
				continue;
			}

			if (range && typeof range === 'object') {
				const candidate = range as { start?: unknown; end?: unknown };
				const start = Number(candidate.start);
				const end = Number(candidate.end);
				if (Number.isFinite(start) && Number.isFinite(end)) {
					normalized.push([start, end]);
				}
			}
		}

		return normalized;
	}

	private estimatePdfPageOffsetFromTocText(
		tocText: string,
		totalPages: number,
	) {
		const chunks = tocText
			.split('\f')
			.map(chunk => chunk.trim())
			.filter(Boolean);
		const offsetFrequency = new Map<number, number>();

		for (let index = 0; index < chunks.length; index += 1) {
			const printedPage = this.extractPrintedFooterPageNumber(
				chunks[index],
				totalPages,
			);

			if (printedPage === null) {
				continue;
			}

			const actualPdfPage = index + 1;
			const offset = actualPdfPage - printedPage;
			offsetFrequency.set(offset, (offsetFrequency.get(offset) || 0) + 1);
		}

		if (!offsetFrequency.size) {
			return {
				offset: 0,
				confidence: 0,
			};
		}

		let bestOffset = 0;
		let bestCount = 0;

		for (const [offset, count] of offsetFrequency.entries()) {
			if (count > bestCount) {
				bestOffset = offset;
				bestCount = count;
			}
		}

		return {
			offset: bestOffset,
			confidence: bestCount,
		};
	}

	private extractPrintedFooterPageNumber(
		pageText: string,
		totalPages: number,
	): number | null {
		const lines = pageText
			.split(/\r?\n/)
			.map(line => line.trim())
			.filter(Boolean);

		if (!lines.length) {
			return null;
		}

		const footerCandidates = lines.slice(-3).reverse();

		for (const line of footerCandidates) {
			if (!/^\d{1,4}$/.test(line)) {
				continue;
			}

			const pageNumber = Number(line);
			if (!Number.isFinite(pageNumber) || pageNumber <= 0) {
				continue;
			}

			if (pageNumber > totalPages) {
				continue;
			}

			return pageNumber;
		}

		return null;
	}

	private applyPageOffsetToRanges(
		ranges: Array<[number, number]>,
		offset: number,
	): Array<[number, number]> {
		if (!offset) {
			return ranges;
		}

		return ranges.map(([start, end]) => [start + offset, end + offset]);
	}

	private buildTocReasoning(
		reasoning: string,
		pageNumberBasis: 'printed' | 'pdf',
		offsetApplied: boolean,
		offset: number,
	) {
		const base = reasoning?.trim() || 'ToC-based filtering.';
		const basisSuffix = ` Page basis: ${pageNumberBasis}.`;

		if (!offsetApplied) {
			return `${base}${basisSuffix}`;
		}

		return `${base}${basisSuffix} Applied PDF offset correction: +${offset}.`;
	}

	private formatError(error: unknown) {
		if (error instanceof Error) {
			return error.message;
		}

		return String(error);
	}

	private extractTextContent(content: unknown): string {
		if (typeof content === 'string') {
			return content;
		}

		if (Array.isArray(content)) {
			return content
				.map(item => {
					if (typeof item === 'string') {
						return item;
					}

					if (
						item &&
						typeof item === 'object' &&
						'text' in item &&
						typeof (item as { text?: unknown }).text === 'string'
					) {
						return (item as { text: string }).text;
					}

					return '';
				})
				.join('\n');
		}

		return '';
	}

	private extractFirstJsonObject(text: string): string {
		const start = text.indexOf('{');
		const end = text.lastIndexOf('}');

		if (start === -1 || end === -1 || end <= start) {
			throw new Error('LLM response does not contain a JSON object');
		}

		return text.slice(start, end + 1);
	}

	private async sanitizePdfBuffer(pdfBuffer: Buffer) {
		try {
			const pdfDoc = await PDFDocument.load(pdfBuffer, {
				ignoreEncryption: true,
			});
			const sanitizedBytes = await pdfDoc.save();
			return Buffer.from(sanitizedBytes);
		} catch (error) {
			this.logger.warn(
				`PDF sanitization failed, using original buffer. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
			return pdfBuffer;
		}
	}

	private async extractTextFromPdf(pdfBuffer: Buffer) {
		const parser = new PDFParse({
			data: new Uint8Array(pdfBuffer),
		});

		try {
			const textResult = await parser.getText();
			return textResult.text || '';
		} finally {
			await parser.destroy().catch(() => undefined);
		}
	}

	private async cropPdfByRanges(
		fileBuffer: Buffer,
		ranges: Array<[number, number]>,
	): Promise<Buffer> {
		const source = await PDFDocument.load(fileBuffer);
		const totalPages = source.getPageCount();
		const normalizedRanges = this.normalizeRanges(ranges, totalPages);
		const output = await PDFDocument.create();

		for (const [start, end] of normalizedRanges) {
			const pageIndexes = Array.from(
				{ length: end - start + 1 },
				(_, index) => start - 1 + index,
			);
			const copiedPages = await output.copyPages(source, pageIndexes);
			for (const page of copiedPages) {
				output.addPage(page);
			}
		}

		if (output.getPageCount() === 0) {
			const copiedPages = await output.copyPages(source, [totalPages - 1]);
			output.addPage(copiedPages[0]);
		}

		const bytes = await output.save();
		return Buffer.from(bytes);
	}

	private normalizeRanges(
		ranges: Array<[number, number]>,
		totalPages: number,
	): Array<[number, number]> {
		const normalized = ranges
			.filter(
				range =>
					Array.isArray(range) &&
					range.length === 2 &&
					Number.isFinite(range[0]) &&
					Number.isFinite(range[1]),
			)
			.map(range => {
				const start = Math.floor(range[0]);
				const end = Math.floor(range[1]);
				const clampedStart = Math.max(1, Math.min(totalPages, start));
				const clampedEnd = Math.max(1, Math.min(totalPages, end));
				return [
					Math.min(clampedStart, clampedEnd),
					Math.max(clampedStart, clampedEnd),
				] as [number, number];
			})
			.sort((a, b) => a[0] - b[0]);

		if (!normalized.length) {
			return [];
		}

		const merged: Array<[number, number]> = [normalized[0]];

		for (const current of normalized.slice(1)) {
			const last = merged[merged.length - 1];
			if (current[0] <= last[1] + 1) {
				last[1] = Math.max(last[1], current[1]);
			} else {
				merged.push(current);
			}
		}

		return merged;
	}

	private buildSafeFallbackRanges(
		totalPages: number,
		config: SmartFilterConfig,
	): Array<[number, number]> {
		if (totalPages <= 0) {
			return [];
		}

		if (config.safeFallbackMode === 'tail') {
			const tailPages = Math.min(totalPages, config.safeTailPages);
			return [[totalPages - tailPages + 1, totalPages]];
		}

		return [[1, totalPages]];
	}

	private buildSafeFallbackReasoning(config: SmartFilterConfig) {
		if (config.safeFallbackMode === 'tail') {
			return `Safe mode enabled: ToC analysis failed; parsed the last ${config.safeTailPages} pages by configuration.`;
		}

		return 'Safe mode enabled: ToC analysis failed; full manual is kept by configuration.';
	}

	private async getPageCount(pdfBuffer: Buffer) {
		const pdf = await PDFDocument.load(pdfBuffer);
		return pdf.getPageCount();
	}

	private calculateReductionPercent(
		originalPages: number,
		filteredPages: number,
	) {
		if (originalPages === 0) {
			return 0;
		}

		const ratio = ((originalPages - filteredPages) / originalPages) * 100;
		return Number(ratio.toFixed(2));
	}

	private resolveSmartFilterConfig(): SmartFilterConfig {
		const fallbackMode = (
			this.configService.get<string>('RAG_SMART_FILTER_FALLBACK_MODE') || 'full'
		)
			.trim()
			.toLowerCase();

		return {
			enabled: this.isFlagEnabled('RAG_SMART_FILTER_ENABLED', true),
			tocScanPages: this.resolvePositiveIntegerConfig(
				'RAG_SMART_FILTER_TOC_PAGES',
				20,
				5,
				80,
			),
			safeFallbackMode: fallbackMode === 'tail' ? 'tail' : 'full',
			safeTailPages: this.resolvePositiveIntegerConfig(
				'RAG_SMART_FILTER_SAFE_TAIL_PAGES',
				120,
				1,
				1000,
			),
		};
	}

	private resolvePositiveIntegerConfig(
		name: string,
		defaultValue: number,
		minValue = 1,
		maxValue = Number.MAX_SAFE_INTEGER,
	) {
		const parsed = Number(this.configService.get<string>(name));
		if (!Number.isFinite(parsed)) {
			return defaultValue;
		}

		return Math.max(minValue, Math.min(maxValue, Math.floor(parsed)));
	}

	private isFlagEnabled(name: string, defaultValue = false) {
		const value = this.configService.get<string>(name);
		if (!value) {
			return defaultValue;
		}

		const normalized = value.trim().toLowerCase();
		return (
			normalized === '1' ||
			normalized === 'true' ||
			normalized === 'yes' ||
			normalized === 'on'
		);
	}
}
