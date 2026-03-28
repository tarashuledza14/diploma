import { tool } from 'langchain';
import { QdrantService } from 'src/langchain-integration/services/qdrant.service';
import { z } from 'zod';

export const createSearchManualsTool = (qdrantService: QdrantService) => {
	return tool(
		async ({ query, carModel }) => {
			const filter = {
				should: [
					{
						key: 'metadata.carModel',
						match: { text: carModel }, // Використовуємо текстовий пошук
					},
				],
			};

			const searchResults = await qdrantService.vectorStore.similaritySearch(
				query,
				5,
				filter,
			);
			if (searchResults.length === 0) {
				return 'No manuals found for this car model.';
			}
			return searchResults
				.map(doc => {
					const imgNote = doc.metadata.imageUrl
						? `\n[DIAGRAM FOUND]: ${doc.metadata.imageUrl}`
						: '';
					return `--- Page ${doc.metadata.pageNumber} ---\n${doc.pageContent}${imgNote}`;
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
		.describe(
			'The specific car make, model, and year to filter the search, e.g., "Toyota Camry 2018" or "VW Passat B8". Leave empty if the user did not specify a car.',
		),
});
