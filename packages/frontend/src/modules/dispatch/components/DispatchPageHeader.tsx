import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DispatchPageHeader() {
	const { t } = useTranslation();

	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-xl font-semibold tracking-tight'>
					{t('dispatch.title')}
				</h1>
				<p className='text-sm text-muted-foreground'>
					{t('dispatch.subtitle')}
				</p>
			</div>
			<div className='hidden items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground md:flex'>
				<ClipboardList className='size-4' />
				<span>{t('dispatch.boardMode')}</span>
			</div>
		</div>
	);
}
