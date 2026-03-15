import {
	Button,
	Card,
	CardContent,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Download, Filter, Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface OrdersFiltersProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	statusFilter: string;
	setStatusFilter: (v: string) => void;
	priorityFilter: string;
	setPriorityFilter: (v: string) => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	searchQuery,
	setSearchQuery,
	statusFilter,
	setStatusFilter,
	priorityFilter,
	setPriorityFilter,
}) => {
	const { t } = useTranslation();
	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='flex flex-col gap-4 md:flex-row md:items-center'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							placeholder={t('orders.filters.searchPlaceholder')}
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='pl-9'
						/>
					</div>
					<div className='flex gap-2'>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className='w-40'>
								<Filter className='mr-2 h-4 w-4' />
								<SelectValue placeholder={t('common.status')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>
									{t('orders.filters.allStatus')}
								</SelectItem>
								<SelectItem value='new'>{t('orderStatus.NEW')}</SelectItem>
								<SelectItem value='in_progress'>
									{t('orderStatus.IN_PROGRESS')}
								</SelectItem>
								<SelectItem value='waiting_parts'>
									{t('orderStatus.WAITING_PARTS')}
								</SelectItem>
								<SelectItem value='done'>{t('orders.filters.done')}</SelectItem>
							</SelectContent>
						</Select>
						<Select value={priorityFilter} onValueChange={setPriorityFilter}>
							<SelectTrigger className='w-40'>
								<SelectValue placeholder={t('common.priority')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>
									{t('orders.filters.allPriority')}
								</SelectItem>
								<SelectItem value='high'>{t('orderPriority.HIGH')}</SelectItem>
								<SelectItem value='medium'>
									{t('orderPriority.MEDIUM')}
								</SelectItem>
								<SelectItem value='low'>{t('orderPriority.LOW')}</SelectItem>
							</SelectContent>
						</Select>
						<Button variant='outline'>
							<Download className='mr-2 h-4 w-4' />
							{t('common.export')}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
