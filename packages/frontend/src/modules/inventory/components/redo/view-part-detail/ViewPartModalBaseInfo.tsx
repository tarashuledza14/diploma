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
			<h4 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
				<FileText className='h-4 w-4' />
				Base Information
			</h4>

			{/* Контейнер сітки охоплює ВСІ елементи */}
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-12 sm:gap-y-4'>
				{/* OEM Number (Зліва) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>OEM Number</span>
					<span className='font-mono text-right'>
						{selectedPart.oem ?? 'N/A'}
					</span>
				</div>

				{/* Barcode (Справа) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Barcode</span>
					<span className='font-mono text-right'>
						{selectedPart.barcode ?? 'N/A'}
					</span>
				</div>

				{/* Category (Зліва) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Category</span>
					<Badge variant='secondary' className='font-normal'>
						{selectedPart.category?.name ?? 'N/A'}
					</Badge>
				</div>

				{/* Brand (Справа) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Brand</span>
					<span className='text-right'>
						{selectedPart.brand?.name ?? 'N/A'}
					</span>
				</div>

				{/* Code (Я залишив його тут, якщо він вам потрібен. Якщо ні — просто видаліть цей блок) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>Code</span>
					<span className='font-mono text-right'>
						{selectedPart.code ?? 'N/A'}
					</span>
				</div>
			</div>
		</div>
	);
}
