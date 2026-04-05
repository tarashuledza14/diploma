import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { InventoryService } from '../../api/inventory.service';
import { inventoryKeys } from '../../query/keys';
import { MovementHistoryList } from './MovementHistoryList';

interface MovementHistoryModalProps {
	partId: string;
	historyModalOpen: boolean;
	setHistoryModalOpen: (open: boolean) => void;
	partName: string;
	partSku: string;
	partUnit: string;
}
export function MovementHistoryModal({
	partId,
	partName,
	partSku,
	partUnit,
	historyModalOpen,
	setHistoryModalOpen,
}: MovementHistoryModalProps) {
	const { t } = useTranslation();
	const shouldLoadHistory = historyModalOpen && Boolean(partId);

	const { data: movementHistory } = useQuery({
		queryKey: inventoryKeys.movements(partId),
		queryFn: () => InventoryService.getMovementHistory(partId),
		enabled: shouldLoadHistory,
	});
	if (!movementHistory) return null;

	const { history, stats } = movementHistory;
	return (
		<ResponsiveDialog
			open={historyModalOpen}
			onOpenChange={setHistoryModalOpen}
		>
			<ResponsiveDialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
				{movementHistory && (
					<>
						<ResponsiveDialogHeader>
							<ResponsiveDialogTitle>
								{t('inventory.actions.movementHistory')}
							</ResponsiveDialogTitle>
							<ResponsiveDialogDescription>
								{t('inventory.movement.description', { partName, partSku })}
							</ResponsiveDialogDescription>
						</ResponsiveDialogHeader>

						{/* Summary */}
						<div className='grid grid-cols-4 gap-3'>
							<div className='rounded-lg border p-2.5 text-center'>
								<p className='text-[11px] text-muted-foreground'>
									{t('inventory.movement.types.received')}
								</p>
								<p className='text-lg font-bold text-green-600'>
									{stats.received}
								</p>
							</div>
							<div className='rounded-lg border p-2.5 text-center'>
								<p className='text-[11px] text-muted-foreground'>
									{t('inventory.movement.types.issued')}
								</p>
								<p className='text-lg font-bold text-blue-600'>
									{stats.issued}
								</p>
							</div>
							<div className='rounded-lg border p-2.5 text-center'>
								<p className='text-[11px] text-muted-foreground'>
									{t('inventory.movement.types.reserved')}
								</p>
								<p className='text-lg font-bold text-amber-600'>
									{stats.reserved}
								</p>
							</div>
							<div className='rounded-lg border p-2.5 text-center'>
								<p className='text-[11px] text-muted-foreground'>
									{t('inventory.movement.types.returned')}
								</p>
								<p className='text-lg font-bold text-purple-600'>
									{stats.returned}
								</p>
							</div>
						</div>

						<div className='mt-4'>
							<MovementHistoryList history={history} partUnit={partUnit} />
						</div>
					</>
				)}
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
