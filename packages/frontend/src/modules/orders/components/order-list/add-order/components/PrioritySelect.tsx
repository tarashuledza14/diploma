import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderPriority } from '../../../../interfaces/order.enums';

export interface PrioritySelectProps {
	priority: OrderPriority;
	setPriority: (priority: OrderPriority) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
	priority,
	setPriority,
}) => {
	const { t } = useTranslation();
	return (
		<div className='space-y-2'>
			<Label>{t('common.priority')}</Label>
			<Select
				value={priority}
				onValueChange={value => setPriority(value as OrderPriority)}
			>
				<SelectTrigger>
					<SelectValue
						placeholder={t('orders.newOrder.placeholders.selectPriority')}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={OrderPriority.LOW}>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-green-500' />
							{t('orderPriority.LOW')}
						</div>
					</SelectItem>
					<SelectItem value={OrderPriority.MEDIUM}>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-amber-500' />
							{t('orderPriority.MEDIUM')}
						</div>
					</SelectItem>
					<SelectItem value={OrderPriority.HIGH}>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-red-500' />
							{t('orderPriority.HIGH')}
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};
