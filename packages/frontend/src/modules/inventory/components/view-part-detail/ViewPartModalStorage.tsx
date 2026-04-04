import dayjs from 'dayjs';
import { Box } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalStorageProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalStorage({
	selectedPart,
}: ViewPartModalStorageProps) {
	const { t } = useTranslation();
	const inventory = selectedPart.inventory ?? [];
	if (!inventory.length) return null;
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Box className='h-4 w-4' />
				{t('inventory.details.storageLogistics')}
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				{inventory.map(item => (
					<div key={item.id} className='border rounded-lg p-2 mb-2'>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>
								{t('inventory.columns.location')}
							</span>
							<span className='font-mono text-right'>
								{item.location ?? t('common.notAvailable')}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>
								{t('inventory.details.batch')}
							</span>
							<span className='font-mono text-right'>
								{item.batchNumber ?? t('common.notAvailable')}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>
								{t('inventory.details.purchasePrice')}
							</span>
							<span className='font-mono text-right'>
								{item.purchasePrice
									? `$${item.purchasePrice}`
									: t('common.notAvailable')}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>
								{t('inventory.details.received')}
							</span>
							<span className='text-right'>
								{item.receivedAt
									? dayjs(item.receivedAt).format('MMM D, YYYY')
									: t('common.notAvailable')}
							</span>
						</div>
					</div>
				))}
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.stock.unitLabel')}
					</span>
					<span className='text-right'>
						{selectedPart.unit ?? t('common.notAvailable')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.stock.minStockLabel')}
					</span>
					<span className='text-right'>
						{selectedPart.minStock ?? t('common.notAvailable')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.stock.weightLabel')}
					</span>
					<span className='text-right'>
						{selectedPart.weight ?? t('common.notAvailable')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.stock.dimensionsLabel')}
					</span>
					<span className='text-right'>
						{selectedPart.dimensions ?? t('common.notAvailable')}
					</span>
				</div>
			</div>
		</div>
	);
}
