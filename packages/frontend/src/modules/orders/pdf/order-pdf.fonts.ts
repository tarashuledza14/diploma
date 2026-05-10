import { Font } from '@react-pdf/renderer';

let isOrderPdfFontRegistered = false;

export function ensureOrderPdfFontsRegistered() {
	if (isOrderPdfFontRegistered) {
		return;
	}

	Font.register({
		family: 'NotoSans',
		fonts: [
			{ src: '/fonts/NotoSans-Regular.ttf', fontWeight: 'normal' },
			{ src: '/fonts/NotoSans-Bold.ttf', fontWeight: 'bold' },
		],
	});

	isOrderPdfFontRegistered = true;
}
