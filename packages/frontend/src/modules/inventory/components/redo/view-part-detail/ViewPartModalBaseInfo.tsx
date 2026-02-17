import { Badge } from '@/shared';
import { FileText } from 'lucide-react';
import { InventoryPart } from '../../../interfaces/inventory.interfaces';

interface ViewPartModalBaseInfoProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalBaseInfo({
	selectedPart,
}: ViewPartModalBaseInfoProps) {
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<FileText className='h-4 w-4' />
				Base Information
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>OEM Number</span>
					<span className='font-mono text-right'>{selectedPart.oem}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Barcode</span>
					<span className='font-mono text-right'>{selectedPart.barcode}</span>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Category</span>
					<Badge variant='secondary' className='ml-2'>
						{selectedPart.category?.name}
					</Badge>
				</div>
				<div className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Brand</span>
					<span className='text-right'>{selectedPart.brand?.name}</span>
				</div>
			</div>
		</div>
	);
}
