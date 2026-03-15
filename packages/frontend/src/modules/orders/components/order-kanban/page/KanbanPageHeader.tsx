import { useTranslation } from 'react-i18next';

export function KanbanPageHeader() {
	const { t } = useTranslation();
	return (
		<div className='mb-4 flex items-center justify-between'>
			<div>
				<h1 className='text-xl font-semibold'>{t('kanban.title')}</h1>
				<p className='text-sm text-muted-foreground'>{t('kanban.subtitle')}</p>
			</div>
		</div>
	);
}
