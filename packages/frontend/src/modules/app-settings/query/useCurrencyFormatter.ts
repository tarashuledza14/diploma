import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_APP_CURRENCY, formatCurrencyValue } from '../lib/currency';
import { useAppBrandingQuery } from './useAppBrandingQuery';

export function useCurrencyFormatter() {
	const { data } = useAppBrandingQuery();
	const { i18n } = useTranslation();
	const currency = data?.currency ?? DEFAULT_APP_CURRENCY;

	return useMemo(
		() => ({
			currency,
			formatCurrency: (value: number | string | null | undefined) =>
				formatCurrencyValue(value, currency, i18n.resolvedLanguage),
		}),
		[currency, i18n.resolvedLanguage],
	);
}
