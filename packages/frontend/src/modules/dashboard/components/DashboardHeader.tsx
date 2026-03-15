import { useTranslation } from 'react-i18next';

export function DashboardHeader() {
	const { t } = useTranslation();
	return (
		<div>
			<h1 className='text-2xl font-bold'>{t('dashboard.title')}</h1>
			<p className='text-muted-foreground'>{t('dashboard.subtitle')}</p>
		</div>
	);
}
