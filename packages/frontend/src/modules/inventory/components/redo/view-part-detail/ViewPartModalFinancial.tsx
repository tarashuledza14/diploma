import { DollarSign } from 'lucide-react';
import { InventoryPart } from '../../../interfaces/inventory.interfaces';

interface ViewPartModalFinancialProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalFinancial({
	selectedPart,
}: ViewPartModalFinancialProps) {
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<DollarSign className='h-4 w-4' />
				Financial
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Purchase Price</span>
					<span className='text-right'>
						${selectedPart.purchasePrice || '0.00'}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Retail Price</span>
					<span className='font-medium text-right'>
						${selectedPart.retailPrice || '0.00'}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Price Category</span>
					<span className='text-right'>{selectedPart.priceCategory}</span>
				</div>
			</div>
		</div>
	);
}
