import { useTranslation } from 'react-i18next';

interface ViewPartModalNotesProps {
	notes?: string | null;
}

export function ViewPartModalNotes({ notes }: ViewPartModalNotesProps) {
	const { t } = useTranslation();
	return (
		<div>
			<h4 className='text-sm font-semibold mb-2'>{t('common.notes')}</h4>
			<p className='text-sm text-muted-foreground rounded-lg border bg-muted/50 p-3'>
				{notes ?? t('common.notAvailable')}
			</p>
		</div>
	);
}
