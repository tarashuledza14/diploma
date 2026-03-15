import { useTranslation } from 'react-i18next';
import { AddClientDialog } from './AddClientDialog';

export function ClientsHeader() {
	const { t } = useTranslation();
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{t('clients.title')}</h1>
				<p className='text-muted-foreground'>{t('clients.subtitle')}</p>
			</div>
			<AddClientDialog />
		</div>
	);
}
