import { pdf } from '@react-pdf/renderer';

export async function downloadOrderPdfDocument(
	document: Parameters<typeof pdf>[0],
	fileName: string,
) {
	const blob = await pdf(document).toBlob();
	const url = URL.createObjectURL(blob);
	const link = globalThis.document.createElement('a');
	link.href = url;
	link.download = fileName;
	globalThis.document.body.appendChild(link);
	link.click();
	globalThis.document.body.removeChild(link);
	setTimeout(() => URL.revokeObjectURL(url), 500);
}
