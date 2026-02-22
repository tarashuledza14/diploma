import { Shield } from 'lucide-react';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalWarrantyProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalWarranty({
	selectedPart,
}: ViewPartModalWarrantyProps) {
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Shield className='h-4 w-4' />
				Warranty
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Duration</span>
					<span className='text-right'>
						{selectedPart.warrantyMonths != null
							? `${selectedPart.warrantyMonths} months`
							: 'N/A'}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Mileage Limit</span>
					<span className='text-right'>
						{typeof selectedPart.warrantyKm === 'number' &&
						selectedPart.warrantyKm > 0
							? `${selectedPart.warrantyKm.toLocaleString()} km`
							: selectedPart.warrantyKm === 0
								? 'No limit'
								: 'N/A'}
					</span>
				</div>
			</div>
		</div>
	);
}
