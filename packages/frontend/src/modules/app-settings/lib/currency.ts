import { AppCurrency } from '../interfaces/branding.interface';

export const DEFAULT_APP_CURRENCY: AppCurrency = 'UAH';

function resolveLocale(language?: string) {
	const normalized = (language ?? 'uk').toLowerCase();
	if (normalized.startsWith('uk')) {
		return 'uk-UA';
	}

	return 'en-US';
}

export function toMoneyNumber(value: number | string | null | undefined) {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

export function formatCurrencyValue(
	value: number | string | null | undefined,
	currency: AppCurrency = DEFAULT_APP_CURRENCY,
	language?: string,
) {
	return new Intl.NumberFormat(resolveLocale(language), {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(toMoneyNumber(value));
}
