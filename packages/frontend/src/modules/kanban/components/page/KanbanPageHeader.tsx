import { useTranslation } from 'react-i18next';

export function KanbanPageHeader() {
	const { t } = useTranslation();
	return (
		<div className='mb-6 flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{t('kanban.title')}</h1>
				<p className='text-muted-foreground'>{t('kanban.subtitle')}</p>
			</div>
		</div>
	);
}
