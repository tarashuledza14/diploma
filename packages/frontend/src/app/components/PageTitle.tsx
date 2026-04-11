import { DEFAULT_APP_NAME, useAppBrandingQuery } from '@/modules/app-settings';
import { getAccessToken } from '@/modules/auth';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type PageTitleProps = {
	children: React.ReactNode;
	title?: string;
	titleKey?: string;
};

export function PageTitle({ children, title, titleKey }: PageTitleProps) {
	const { t } = useTranslation();
	const hasAccessToken = Boolean(getAccessToken());
	const { data: branding } = useAppBrandingQuery({
		enabled: hasAccessToken,
	});
	const appName = branding?.appName?.trim() || DEFAULT_APP_NAME;
	const logoUrl = branding?.logoUrl?.trim() || null;
	const localizedTitle = titleKey ? t(titleKey) : (title ?? '');

	useEffect(() => {
		document.title = `${localizedTitle} | ${appName}`;
	}, [appName, localizedTitle]);

	useEffect(() => {
		const faviconElement =
			document.querySelector<HTMLLinkElement>("link[rel='icon']");

		if (!faviconElement) {
			return;
		}

		if (!faviconElement.dataset.defaultHref) {
			faviconElement.dataset.defaultHref =
				faviconElement.getAttribute('href') || '';
		}

		if (logoUrl) {
			faviconElement.href = logoUrl;
			return;
		}

		faviconElement.href = faviconElement.dataset.defaultHref;
	}, [logoUrl]);

	return <>{children}</>;
}
