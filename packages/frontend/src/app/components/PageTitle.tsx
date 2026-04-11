import { DEFAULT_APP_NAME, useAppBrandingQuery } from '@/modules/app-settings';
import { getAccessToken } from '@/modules/auth';
import { useEffect } from 'react';

type PageTitleProps = {
	children: React.ReactNode;
	title: string;
};

export function PageTitle({ children, title }: PageTitleProps) {
	const hasAccessToken = Boolean(getAccessToken());
	const { data: branding } = useAppBrandingQuery({
		enabled: hasAccessToken,
	});
	const appName = branding?.appName?.trim() || DEFAULT_APP_NAME;
	const logoUrl = branding?.logoUrl?.trim() || null;

	useEffect(() => {
		document.title = `${title} | ${appName}`;
	}, [appName, title]);

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
