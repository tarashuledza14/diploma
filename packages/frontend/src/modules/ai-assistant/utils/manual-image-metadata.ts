export interface ManualImageMetadata {
	manualPdfUrl: string | null;
	pageNumber: number | null;
}

export function parseManualImageMetadata(title?: string): ManualImageMetadata {
	if (!title?.trim()) {
		return {
			manualPdfUrl: null,
			pageNumber: null,
		};
	}

	const entries = title
		.split(';')
		.map(part => part.trim())
		.filter(Boolean);
	const mapped = new Map<string, string>();

	for (const entry of entries) {
		const separatorIndex = entry.indexOf('=');
		if (separatorIndex <= 0) {
			continue;
		}

		const key = entry.slice(0, separatorIndex).trim();
		const value = entry.slice(separatorIndex + 1).trim();
		if (!key) {
			continue;
		}

		mapped.set(key, value);
	}

	const encodedUrl = mapped.get('manual-pdf') ?? null;
	let manualPdfUrl: string | null = null;
	if (encodedUrl) {
		try {
			const decoded = decodeURIComponent(encodedUrl).trim();
			manualPdfUrl = decoded || null;
		} catch {
			manualPdfUrl = null;
		}
	}

	const rawPage = mapped.get('page');
	const parsedPage = Number(rawPage);
	const pageNumber =
		Number.isFinite(parsedPage) && parsedPage > 0
			? Math.floor(parsedPage)
			: null;

	return {
		manualPdfUrl,
		pageNumber,
	};
}

export function buildManualPdfPageUrl(
	manualPdfUrl: string,
	pageNumber: number | null,
): string {
	if (!pageNumber) {
		return manualPdfUrl;
	}

	if (manualPdfUrl.includes('#')) {
		const separator =
			manualPdfUrl.endsWith('#') || manualPdfUrl.endsWith('&') ? '' : '&';
		return `${manualPdfUrl}${separator}page=${pageNumber}`;
	}

	return `${manualPdfUrl}#page=${pageNumber}`;
}
