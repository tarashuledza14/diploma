import { CropperAreaData } from '@/shared';

type CreateCroppedSquareImageFileParams = {
	sourceUrl: string;
	sourceFile: File;
	croppedArea: CropperAreaData;
};

const FALLBACK_IMAGE_MIME_TYPE = 'image/png';

function resolveImageMimeType(file: File) {
	return file.type.startsWith('image/') ? file.type : FALLBACK_IMAGE_MIME_TYPE;
}

function resolveFileExtension(mimeType: string) {
	if (mimeType === 'image/png') {
		return 'png';
	}

	if (mimeType === 'image/webp') {
		return 'webp';
	}

	if (mimeType === 'image/jpeg') {
		return 'jpg';
	}

	return 'png';
}

function loadImage(sourceUrl: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () =>
			reject(new Error('Failed to load image for cropping'));
		image.src = sourceUrl;
	});
}

function toBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			blob => {
				if (!blob) {
					reject(new Error('Failed to create cropped image blob'));
					return;
				}

				resolve(blob);
			},
			mimeType,
			0.92,
		);
	});
}

export async function createCroppedSquareImageFile({
	sourceUrl,
	sourceFile,
	croppedArea,
}: CreateCroppedSquareImageFileParams) {
	const image = await loadImage(sourceUrl);
	const mimeType = resolveImageMimeType(sourceFile);

	const sourceX = Math.max(0, Math.floor(croppedArea.x));
	const sourceY = Math.max(0, Math.floor(croppedArea.y));
	const sourceWidth = Math.min(
		Math.floor(croppedArea.width),
		image.naturalWidth - sourceX,
	);
	const sourceHeight = Math.min(
		Math.floor(croppedArea.height),
		image.naturalHeight - sourceY,
	);

	if (sourceWidth <= 0 || sourceHeight <= 0) {
		throw new Error('Cropped area is invalid');
	}

	const canvas = document.createElement('canvas');
	canvas.width = sourceWidth;
	canvas.height = sourceHeight;

	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas context is not available');
	}

	context.drawImage(
		image,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		0,
		0,
		sourceWidth,
		sourceHeight,
	);

	const blob = await toBlob(canvas, mimeType);
	const sourceNameWithoutExtension = sourceFile.name.replace(/\.[^/.]+$/, '');
	const extension = resolveFileExtension(mimeType);
	const fileName = `${sourceNameWithoutExtension}-cropped.${extension}`;

	return new File([blob], fileName, {
		type: mimeType,
		lastModified: Date.now(),
	});
}
