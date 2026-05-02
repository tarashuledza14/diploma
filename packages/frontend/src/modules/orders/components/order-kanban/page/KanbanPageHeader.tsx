import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function KanbanPageHeader() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className='mb-4 flex items-center justify-between'>
			<div>
				<h1 className='text-xl font-semibold'>{t('kanban.title')}</h1>
				<p className='text-sm text-muted-foreground'>{t('kanban.subtitle')}</p>
			</div>
			<Button
				variant='outline'
				size='sm'
				onClick={() => navigate('/orders')}
				className='gap-2'
			>
				<ArrowLeft className='h-4 w-4' />
				{t('common.backToTable')}
			</Button>
		</div>
	);
}
