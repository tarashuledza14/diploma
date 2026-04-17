import { Logger } from '@nestjs/common';
import { tool } from 'langchain';
import { ManualRetrieverService } from 'src/langchain-integration/services/manual-retriever.service';
import { z } from 'zod';

type SupportedResponseLanguage = 'uk' | 'en';
type DetectedQueryLanguage = SupportedResponseLanguage | 'unknown';
const MANUAL_SEARCH_TOP_K = 12;
const logger = new Logger('SearchManualsTool');

export const createSearchManualsTool = (
	manualRetrieverService: ManualRetrieverService,
	organizationId: string | null,
	preferredLanguage: SupportedResponseLanguage = 'uk',
	latestUserMessage = '',
) => {
	return tool(
		async ({ query, carModel }) => {
			const sourceLinkPrefix =
				preferredLanguage === 'en'
					? 'Open PDF on page'
					: 'Відкрити PDF на сторінці';
			const effectiveQuery = resolveEffectiveSearchQuery({
				rawQuery: query,
				latestUserMessage,
				preferredLanguage,
			});

			if (!organizationId) {
				return 'No organization context found for this request.';
			}

			const searchResults = await manualRetrieverService.searchManuals({
				query: effectiveQuery,
				carModel,
				organizationId,
				k: MANUAL_SEARCH_TOP_K,
			});

			if (searchResults.length === 0) {
				return carModel?.trim()
					? 'No manuals found for this car model.'
					: 'No manuals found for this query.';
			}

			const pdfUrlByVectorRef = new Map<string, string | null>();
			const formattedPages = await Promise.all(
				searchResults.map(async doc => {
					const metadata = doc.metadata as Record<string, unknown>;
					const pageNumber = resolveOriginalPdfPageNumber(metadata);

					const vectorRef =
						typeof metadata.vectorRef === 'string'
							? metadata.vectorRef.trim()
							: '';
					let pdfUrl: string | null = null;

					if (vectorRef) {
						if (pdfUrlByVectorRef.has(vectorRef)) {
							pdfUrl = pdfUrlByVectorRef.get(vectorRef) ?? null;
						} else {
							pdfUrl = await manualRetrieverService.resolveManualPdfUrl(
								metadata,
								organizationId,
							);
							pdfUrlByVectorRef.set(vectorRef, pdfUrl);
						}
					} else {
						pdfUrl = await manualRetrieverService.resolveManualPdfUrl(
							metadata,
							organizationId,
						);
					}

					const pdfPageUrl = pageNumber
						? buildPdfPageUrl(pdfUrl, pageNumber)
						: null;

					return {
						pageSection: doc.pageContent,
						pageNumber,
						sourceLink: pdfPageUrl
							? `[${sourceLinkPrefix} ${pageNumber}](${pdfPageUrl})`
							: '',
					};
				}),
			);

			const pageSections = formattedPages
				.map(item => item.pageSection)
				.join('\n\n');
			const sourceCandidates = formattedPages.filter(item =>
				Boolean(item.sourceLink),
			);
			const bestSource = sourceCandidates[0] ?? null;

			const bestSourceLink = bestSource?.sourceLink || '';

			logger.log(
				`Source selection for query="${effectiveQuery}": candidates=${sourceCandidates
					.map(item => `${item.pageNumber ?? 'unknown'}`)
					.join(', ')}, selectedPage=${bestSource?.pageNumber ?? 'none'}`,
			);

			return bestSourceLink
				? `${pageSections}\n\n${bestSourceLink}`
				: pageSections;
		},
		{
			name: 'search_manuals',
			description:
				'Searches the database of official car manuals. Use this tool to find specific parts, repair procedures, wiring diagrams, torque specs, or maintenance recommendations.',
			schema: searchManualsSchema,
		},
	);
};

function normalizePageNumber(value: unknown): number | null {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}

	return Math.floor(parsed);
}

function resolveOriginalPdfPageNumber(
	metadata: Record<string, unknown>,
): number | null {
	return normalizePageNumber(metadata.originalPageNumber);
}

function buildPdfPageUrl(
	pdfUrl: string | null,
	pageNumber: number | null,
): string | null {
	if (!pdfUrl?.trim()) {
		return null;
	}

	if (!pageNumber) {
		return pdfUrl;
	}

	if (pdfUrl.includes('#')) {
		const separator = pdfUrl.endsWith('#') || pdfUrl.endsWith('&') ? '' : '&';
		return `${pdfUrl}${separator}page=${pageNumber}`;
	}

	return `${pdfUrl}#page=${pageNumber}`;
}

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

function truncateQuery(value: string, maxLength = 500): string {
	if (!value) {
		return '';
	}

	if (value.length <= maxLength) {
		return value;
	}

	return value.slice(0, maxLength).trim();
}

function detectQueryLanguage(value: string): DetectedQueryLanguage {
	if (!value) {
		return 'unknown';
	}

	const cyrillicCount = value.match(/[\u0400-\u04FF]/g)?.length ?? 0;
	const latinCount = value.match(/[A-Za-z]/g)?.length ?? 0;

	if (cyrillicCount === 0 && latinCount === 0) {
		return 'unknown';
	}

	return latinCount > cyrillicCount ? 'en' : 'uk';
}

function resolveEffectiveSearchQuery(params: {
	rawQuery: string;
	latestUserMessage: string;
	preferredLanguage: SupportedResponseLanguage;
}): string {
	const rawQuery = truncateQuery(normalizeWhitespace(params.rawQuery));
	const userMessage = truncateQuery(
		normalizeWhitespace(params.latestUserMessage),
	);

	if (!rawQuery && userMessage) {
		return userMessage;
	}

	if (!userMessage) {
		return rawQuery;
	}

	const rawLanguage = detectQueryLanguage(rawQuery);
	const userMessageLanguage = detectQueryLanguage(userMessage);

	const isRawPreferred = rawLanguage === params.preferredLanguage;
	const isUserPreferred = userMessageLanguage === params.preferredLanguage;

	if (!isRawPreferred && isUserPreferred) {
		return userMessage;
	}

	return rawQuery;
}

const searchManualsSchema = z.object({
	query: z
		.string()
		.describe(
			'The core technical search query, e.g., "brake pads replacement" or "cylinder head torque specs". Do NOT include the car model in this string.',
		),
	carModel: z
		.string()
		.optional()
		.default('')
		.describe(
			'The specific car make, model, and year to filter the search, e.g., "Toyota Camry 2018" or "VW Passat B8". Leave empty if the user did not specify a car.',
		),
});
