import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

export function NotificationButton({ count }: { count: number }) {
	const { t } = useTranslation();

	return (
		<Button variant='ghost' size='icon' className='relative'>
			<Bell className='h-5 w-5' />
			{count > 0 && (
				<Badge
					variant='destructive'
					className='absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs'
				>
					{count}
				</Badge>
			)}
			<span className='sr-only'>{t('header.viewNotifications')}</span>
			{/* TODO: Open notification drawer/popover on click */}
		</Button>
	);
}
