import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { jsonrepair } from 'jsonrepair';
import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';
import z from 'zod';

const tocAnalysisSchema = z.object({
	ranges: z.array(z.tuple([z.number(), z.number()])).default([]),
	reasoning: z.string().default(''),
});

type TocAnalysisResult = {
	ranges: Array<[number, number]>;
	reasoning: string;
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
	});

	async processSmartPdf(fileBuffer: Buffer): Promise<SmartPdfProcessingResult> {
		const sanitizedInputBuffer = await this.sanitizePdfBuffer(fileBuffer);
		const originalPdf = await PDFDocument.load(sanitizedInputBuffer);
		const originalPages = originalPdf.getPageCount();

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

		try {
			const tocPageEnd = Math.min(15, originalPages);
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
			const normalizedRanges = this.normalizeRanges(
				llmResult.ranges,
				originalPages,
			);

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
				reasoning: llmResult.reasoning,
				mode: 'toc',
			};
		} catch (error) {
			this.logger.warn(
				`ToC analysis failed, switching to safe mode. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);

			const safeRanges = this.buildSafeFallbackRanges(originalPages);
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
				reasoning:
					'Safe mode enabled: parsed only the last 50 pages because ToC analysis failed or returned no useful ranges.',
				mode: 'safe',
			};
		}
	}

	private async analyzeTableOfContents(
		tocText: string,
		totalPages: number,
	): Promise<TocAnalysisResult> {
		const response = await this.llm.invoke([
			{
				role: 'system',
				content:
					'You are a specialized Technical Data Analyst. Review the provided Table of Contents from a car manual. Identify page ranges for: Engine, Transmission, Suspension, Brakes, Electrical Systems, Maintenance, and Technical Specifications. Ignore: Safety warnings, entertainment systems, seat adjustments, and legal notices. Return ONLY a JSON object: { "ranges": [[start, end], [start, end]], "reasoning": "string" }',
			},
			{
				role: 'user',
				content: `Table of Contents text (first pages) from a car manual. Total pages: ${totalPages}.\n\n${tocText.slice(0, 24000)}`,
			},
		]);

		const rawText = this.extractTextContent(response.content);
		const jsonPayload = this.extractFirstJsonObject(rawText);
		const parsed = tocAnalysisSchema.safeParse(
			JSON.parse(jsonrepair(jsonPayload)),
		);

		if (!parsed.success) {
			throw new Error(`Invalid ToC JSON format: ${parsed.error.message}`);
		}

		return {
			ranges: parsed.data.ranges.map(range => [range[0], range[1]]),
			reasoning: parsed.data.reasoning,
		};
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

	private buildSafeFallbackRanges(totalPages: number): Array<[number, number]> {
		if (totalPages <= 50) {
			return [[1, totalPages]];
		}

		return [[totalPages - 49, totalPages]];
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
}
