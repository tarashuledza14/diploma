import { Badge, cn, compactSecondaryBadgeClass } from '@/shared';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalBaseInfoProps {
	selectedPart: InventoryPart;
}

export function ViewPartModalBaseInfo({
	selectedPart,
}: ViewPartModalBaseInfoProps) {
	const { t } = useTranslation();
	return (
		<div>
			<h4 className='mb-4 flex items-center gap-2 text-sm font-semibold'>
				<FileText className='h-4 w-4' />
				{t('inventory.details.baseInformation')}
			</h4>

			{/* Контейнер сітки охоплює ВСІ елементи */}
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-12 sm:gap-y-4'>
				{/* OEM Number (Зліва) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.base.oemLabel')}
					</span>
					<span className='font-mono text-right'>
						{selectedPart.oem ?? t('common.notAvailable')}
					</span>
				</div>

				{/* Barcode (Справа) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.base.barcodeLabel')}
					</span>
					<span className='font-mono text-right'>
						{selectedPart.barcode ?? t('common.notAvailable')}
					</span>
				</div>

				{/* Category (Зліва) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.base.categoryLabel')}
					</span>
					<Badge
						variant='secondary'
						className={cn(compactSecondaryBadgeClass, 'font-normal')}
					>
						{selectedPart.category?.name ?? t('common.notAvailable')}
					</Badge>
				</div>

				{/* Brand (Справа) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.form.base.brandLabel')}
					</span>
					<span className='text-right'>
						{selectedPart.brand?.name ?? t('common.notAvailable')}
					</span>
				</div>

				{/* Code (Я залишив його тут, якщо він вам потрібен. Якщо ні — просто видаліть цей блок) */}
				<div className='flex items-center justify-between border-b border-dashed pb-2 sm:border-0 sm:pb-0'>
					<span className='text-muted-foreground'>
						{t('inventory.details.code')}
					</span>
					<span className='font-mono text-right'>
						{selectedPart.code ?? t('common.notAvailable')}
					</span>
				</div>
			</div>
		</div>
	);
}
