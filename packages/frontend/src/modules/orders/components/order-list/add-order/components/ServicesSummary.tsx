import { useCurrencyFormatter } from '@/modules/app-settings';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ServicesSummaryProps {
	totalDuration: number;
	totalPrice: number;
}

export const ServicesSummary: React.FC<ServicesSummaryProps> = ({
	totalDuration,
	totalPrice,
}) => {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();

	if (!totalDuration && !totalPrice) return null;
	return (
		<div className='mt-3 rounded-lg border bg-muted/50 p-3'>
			<div className='flex justify-between text-sm'>
				<span className='text-muted-foreground'>
					{t('orders.detailsServices.estimatedDuration')}
				</span>
				<span className='font-medium'>
					{t('orders.detailsServices.hoursValue', { value: totalDuration })}
				</span>
			</div>
			<div className='flex justify-between text-sm mt-1'>
				<span className='text-muted-foreground'>
					{t('orders.totals.servicesTotal')}:
				</span>
				<span className='font-medium'>{formatCurrency(totalPrice)}</span>
			</div>
		</div>
	);
};
