import { tool } from 'langchain';
import { QdrantService } from 'src/langchain-integration/services/qdrant.service';
import { z } from 'zod';

export const createSearchManualsTool = (qdrantService: QdrantService) => {
	return tool(
		async ({ query, carModel }) => {
			const normalizedCarModel = carModel?.trim() ?? '';
			const normalizedCarModelLower = normalizedCarModel.toLowerCase();

			const filter = normalizedCarModel
				? {
						should: [
							{
								key: 'metadata.carModel',
								match: { value: normalizedCarModel },
							},
						],
					}
				: undefined;

			let searchResults = await qdrantService.vectorStore.similaritySearch(
				query,
				6,
				filter,
			);

			// If strict model filter misses data (e.g., "Cayenne" vs "Porsche Cayenne"),
			// retry without filter and then prefer documents whose metadata matches model text.
			if (searchResults.length === 0 && normalizedCarModel) {
				searchResults = await qdrantService.vectorStore.similaritySearch(
					`${query} ${normalizedCarModel}`,
					10,
				);

				const matchingModelDocs = searchResults.filter(doc => {
					const model = String(doc.metadata?.carModel ?? '').toLowerCase();
					return model.includes(normalizedCarModelLower);
				});

				if (matchingModelDocs.length > 0) {
					searchResults = matchingModelDocs;
				}
			}

			searchResults = searchResults.slice(0, 6);

			if (searchResults.length === 0) {
				return normalizedCarModel
					? 'No manuals found for this car model.'
					: 'No manuals found for this query.';
			}

			const seenImageUrls = new Set<string>();

			return searchResults
				.map(doc => {
					const { pageNumber, fullPageImageUrl, imageUrl } = doc.metadata;
					const pageLabel = pageNumber ?? 'unknown';
					const url = fullPageImageUrl || imageUrl;
					let imgNote = '';

					if (url && !seenImageUrls.has(url)) {
						seenImageUrls.add(url);
						imgNote = `\n![Технічна схема сторінки ${pageLabel}](${url})`;
					}

					return `--- Page ${pageLabel} ---\n${doc.pageContent}${imgNote}`;
				})
				.join('\n\n');
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
