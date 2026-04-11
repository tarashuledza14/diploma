import { Button } from '@/shared/components/ui';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TeamHeaderProps {
	onInviteClick: () => void;
}

export function TeamHeader({ onInviteClick }: TeamHeaderProps) {
	const { t } = useTranslation();

	return (
		<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
			<div>
				<h1 className='text-2xl font-semibold'>{t('team.title')}</h1>
				<p className='text-sm text-muted-foreground'>{t('team.subtitle')}</p>
			</div>

			<Button
				type='button'
				onClick={onInviteClick}
				className='w-full sm:w-auto'
			>
				<UserPlus className='mr-2 size-4' />
				{t('team.actions.invite')}
			</Button>
		</div>
	);
}
