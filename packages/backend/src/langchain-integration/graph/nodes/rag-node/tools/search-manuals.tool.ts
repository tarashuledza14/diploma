import { tool } from 'langchain';
import { ManualRetrieverService } from 'src/langchain-integration/services/manual-retriever.service';
import { z } from 'zod';

export const createSearchManualsTool = (
	manualRetrieverService: ManualRetrieverService,
	organizationId: string | null,
) => {
	return tool(
		async ({ query, carModel }) => {
			if (!organizationId) {
				return 'No organization context found for this request.';
			}

			const searchResults = await manualRetrieverService.searchManuals({
				query,
				carModel,
				organizationId,
				k: 6,
			});

			if (searchResults.length === 0) {
				return carModel?.trim()
					? 'No manuals found for this car model.'
					: 'No manuals found for this query.';
			}

			const seenImageUrls = new Set<string>();
			const formattedPages = await Promise.all(
				searchResults.map(async doc => {
					const metadata = doc.metadata as Record<string, unknown>;
					const pageNumber = metadata.pageNumber;
					const pageLabel = pageNumber ?? 'unknown';
					const url =
						await manualRetrieverService.resolveManualImageUrl(metadata);
					let imgNote = '';

					if (url && !seenImageUrls.has(url)) {
						seenImageUrls.add(url);
						imgNote = `\n![Технічна схема сторінки ${pageLabel}](${url})`;
					}

					return `--- Page ${pageLabel} ---\n${doc.pageContent}${imgNote}`;
				}),
			);

			return formattedPages.join('\n\n');
		},
		{
			name: 'search_manuals',
			description:
				'Searches the database of official car manuals. Use this tool to find specific parts, repair procedures, wiring diagrams, torque specs, or maintenance recommendations.',
			schema: searchManualsSchema,
		},
	);
};
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
