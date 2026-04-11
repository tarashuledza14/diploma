import { useCurrencyFormatter } from '@/modules/app-settings';
import { Separator } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

interface PartsTotalsProps {
	partsTotal: number;
	servicesTotal: number;
	grandTotal: number;
}

export function PartsTotals({
	partsTotal,
	servicesTotal,
	grandTotal,
}: PartsTotalsProps) {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();

	return (
		<div className='flex justify-end'>
			<div className='w-64 space-y-2'>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>
						{t('orders.totals.partsTotal')}
					</span>
					<span className='font-medium'>{formatCurrency(partsTotal)}</span>
				</div>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>
						{t('orders.totals.servicesTotal')}
					</span>
					<span className='font-medium'>{formatCurrency(servicesTotal)}</span>
				</div>
				<Separator />
				<div className='flex justify-between text-lg font-bold'>
					<span>{t('orders.totals.grandTotal')}</span>
					<span>{formatCurrency(grandTotal)}</span>
				</div>
			</div>
		</div>
	);
}
