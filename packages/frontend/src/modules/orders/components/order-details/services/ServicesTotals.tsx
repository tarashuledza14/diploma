import { useTranslation } from 'react-i18next';

interface ServicesTotalsProps {
	servicesTotal: number;
}

export function ServicesTotals({ servicesTotal }: ServicesTotalsProps) {
	const { t } = useTranslation();

	return (
		<div className='flex justify-end'>
			<div className='w-64 space-y-2'>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>
						{t('orders.totals.servicesTotal')}
					</span>
					<span className='font-medium'>${servicesTotal.toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}
