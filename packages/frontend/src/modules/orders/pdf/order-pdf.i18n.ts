import i18n from '@/i18n/config';

type TranslationOptions = Record<string, string | number>;

export function getOrderPdfTranslator(language?: string) {
	const t = i18n.getFixedT(language);

	return (key: string, defaultValue: string, options?: TranslationOptions) =>
		t(key, {
			defaultValue,
			...(options ?? {}),
		});
}

export function getOrderPriorityLabel(priority: string, language?: string) {
	const t = i18n.getFixedT(language);
	return t(`orderPriority.${priority}`, { defaultValue: priority });
}

export function getOrderStatusLabel(status: string, language?: string) {
	const t = i18n.getFixedT(language);
	return t(`orderStatus.${status}`, { defaultValue: status });
}
