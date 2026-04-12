import {
	Badge,
	Button,
	inventoryConditionColors,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared';
import { Edit, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
	InventoryPart,
	PartCondition,
} from '../../interfaces/inventory.interfaces';

function getConditionBadge(
	condition: InventoryPart['condition'],
	t: (key: string) => string,
) {
	switch (condition) {
		case PartCondition.NEW:
			return {
				label: t('inventory.form.details.condition.new'),
				className: inventoryConditionColors.NEW,
			};
		case PartCondition.USED:
			return {
				label: t('inventory.form.details.condition.used'),
				className: inventoryConditionColors.USED,
			};
		case PartCondition.REFURBISHED:
			return {
				label: t('inventory.form.details.condition.refurbished'),
				className: inventoryConditionColors.REFURBISHED,
			};
		default:
			return {
				label: t('inventory.unknown'),
				className: inventoryConditionColors.UNKNOWN,
			};
	}
}

interface ViewPartModalHeaderProps {
	selectedPart: InventoryPart;
	onOpenChange: (open: boolean) => void;
	handleEdit: (part: InventoryPart) => void;
	handleHistory: (part: InventoryPart) => void;
}

export function ViewPartModalHeader({
	selectedPart,
	onOpenChange,
	handleEdit,
	handleHistory,
}: ViewPartModalHeaderProps) {
	const { t } = useTranslation();
	const conditionBadge = getConditionBadge(selectedPart.condition, t);

	return (
		<ResponsiveDialogHeader className='pb-4'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<ResponsiveDialogTitle className='text-lg sm:text-xl wrap-break-word'>
						{selectedPart.name}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription className='flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm'>
						<span className='font-mono'>
							{selectedPart.sku ?? t('common.notAvailable')}
						</span>
						<span className='font-mono'>
							{selectedPart.code ?? t('common.notAvailable')}
						</span>
						<span className='hidden sm:inline'>|</span>
						<span>{selectedPart.brand?.name || t('common.notAvailable')}</span>
						<span className='hidden sm:inline'>|</span>
						<Badge className={conditionBadge.className}>
							{conditionBadge.label}
						</Badge>
					</ResponsiveDialogDescription>
				</div>
				<div className='flex gap-2 w-full sm:w-auto'>
					<Button
						variant='outline'
						size='sm'
						className='flex-1 sm:flex-none'
						onClick={() => {
							onOpenChange(false);
							setTimeout(() => handleEdit(selectedPart), 150);
						}}
					>
						<Edit className='mr-1.5 h-3.5 w-3.5' />
						{t('common.edit')}
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='flex-1 sm:flex-none'
						onClick={() => {
							onOpenChange(false);
							setTimeout(() => handleHistory(selectedPart), 150);
						}}
					>
						<History className='mr-1.5 h-3.5 w-3.5' />
						{t('inventory.actions.movementHistory')}
					</Button>
				</div>
			</div>
		</ResponsiveDialogHeader>
	);
}
