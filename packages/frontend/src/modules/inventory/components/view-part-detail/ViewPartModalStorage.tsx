import dayjs from 'dayjs';
import { Box } from 'lucide-react';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalStorageProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalStorage({
	selectedPart,
}: ViewPartModalStorageProps) {
	const inventory = selectedPart.inventory ?? [];
	if (!inventory.length) return null;
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<Box className='h-4 w-4' />
				Storage & Logistics
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				{inventory.map(item => (
					<div key={item.id} className='border rounded-lg p-2 mb-2'>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Location</span>
							<span className='font-mono text-right'>
								{item.location ?? 'N/A'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Batch</span>
							<span className='font-mono text-right'>
								{item.batchNumber ?? 'N/A'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Purchase Price</span>
							<span className='font-mono text-right'>
								{item.purchasePrice ? `$${item.purchasePrice}` : 'N/A'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Received</span>
							<span className='text-right'>
								{item.receivedAt
									? dayjs(item.receivedAt).format('MMM D, YYYY')
									: 'N/A'}
							</span>
						</div>
					</div>
				))}
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Unit</span>
					<span className='text-right'>{selectedPart.unit ?? 'N/A'}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Min Stock Level</span>
					<span className='text-right'>{selectedPart.minStock ?? 'N/A'}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Weight</span>
					<span className='text-right'>{selectedPart.weight ?? 'N/A'}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Dimensions</span>
					<span className='text-right'>{selectedPart.dimensions ?? 'N/A'}</span>
				</div>
			</div>
		</div>
	);
}
