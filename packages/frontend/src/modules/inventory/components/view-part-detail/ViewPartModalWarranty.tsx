import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalWarrantyProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalWarranty({
	selectedPart,
}: ViewPartModalWarrantyProps) {
	const { t } = useTranslation();
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Shield className='h-4 w-4' />
				{t('inventory.form.details.warrantyTitle')}
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.details.duration')}
					</span>
					<span className='text-right'>
						{selectedPart.warrantyMonths != null
							? t('inventory.details.monthsValue', {
									value: selectedPart.warrantyMonths,
								})
							: t('common.notAvailable')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.details.mileageLimit')}
					</span>
					<span className='text-right'>
						{typeof selectedPart.warrantyKm === 'number' &&
						selectedPart.warrantyKm > 0
							? t('inventory.details.kmValue', {
									value: selectedPart.warrantyKm.toLocaleString(),
								})
							: selectedPart.warrantyKm === 0
								? t('inventory.details.noLimit')
								: t('common.notAvailable')}
					</span>
				</div>
			</div>
		</div>
	);
}
