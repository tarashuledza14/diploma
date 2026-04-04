import { Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalSupplierProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalSupplier({
	selectedPart,
}: ViewPartModalSupplierProps) {
	const { t } = useTranslation();
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Truck className='h-4 w-4' />
				{t('inventory.form.finance.supplierLabel')}
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.details.name')}
					</span>
					<span className='font-medium text-right'>
						{selectedPart.supplier?.name ?? t('common.notAvailable')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.details.contact')}
					</span>
					<span className='text-right'>
						{selectedPart.supplier?.contact ?? t('common.notAvailable')}
					</span>
				</div>
			</div>
		</div>
	);
}
