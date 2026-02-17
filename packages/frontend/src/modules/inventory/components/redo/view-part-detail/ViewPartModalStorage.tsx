import dayjs from 'dayjs';
import { Box } from 'lucide-react';
import { InventoryPart } from '../../../interfaces/inventory.interfaces';

interface ViewPartModalStorageProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalStorage({
	selectedPart,
}: ViewPartModalStorageProps) {
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Box className='h-4 w-4' />
				Storage & Logistics
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Location</span>
					<span className='font-mono font-medium text-right'>
						{selectedPart.location}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Unit</span>
					<span className='text-right'>{selectedPart.unit}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Min Stock Level</span>
					<span className='text-right'>{selectedPart.minStock}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Last Restocked</span>
					<span className='text-right'>
						{dayjs(selectedPart.lastRestocked).format('MMM D, YYYY')}
					</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Weight</span>
					<span className='text-right'>{selectedPart.weight}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Dimensions</span>
					<span className='text-right'>{selectedPart.dimensions}</span>
				</div>
			</div>
		</div>
	);
}
