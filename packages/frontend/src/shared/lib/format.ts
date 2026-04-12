import i18n from '@/i18n/config';

export function formatDate(
	date: Date | string | number | undefined,
	opts: Intl.DateTimeFormatOptions = {},
) {
	if (!date) return '';

	try {
		const language = i18n.resolvedLanguage ?? i18n.language;
		const locale = language?.startsWith('uk') ? 'uk-UA' : 'en-US';

		return new Intl.DateTimeFormat(locale, {
			month: opts.month ?? 'long',
			day: opts.day ?? 'numeric',
			year: opts.year ?? 'numeric',
			...opts,
		}).format(new Date(date));
	} catch (_err) {
		return '';
	}
}
