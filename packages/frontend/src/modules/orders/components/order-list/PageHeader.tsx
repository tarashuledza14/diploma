import { Button } from '@/shared/components/ui';
import { Kanban } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NewOrderModal } from './add-order/AddOrder';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	showKanban?: boolean;
	kanbanUrl?: string;
	showNewOrder?: boolean;
	newOrderHandler?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	subtitle,
	showKanban = true,
	kanbanUrl = '/orders/board',
	showNewOrder = true,
}) => {
	const { t } = useTranslation();

	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{title}</h1>
				{subtitle && <p className='text-muted-foreground'>{subtitle}</p>}
			</div>
			<div className='flex gap-2'>
				{showKanban && (
					<Link to={kanbanUrl}>
						<Button variant='outline'>
							<Kanban className='mr-2 h-4 w-4' />
							{t('orders.actions.kanbanView')}
						</Button>
					</Link>
				)}
				{showNewOrder && <NewOrderModal />}
			</div>
		</div>
	);
};
