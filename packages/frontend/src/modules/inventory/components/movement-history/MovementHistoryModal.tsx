import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, Loader } from 'lucide-react';
import { useState } from 'react';
import { InventoryService } from '../../api/inventory.service';
import { inventoryKeys } from '../../query/keys';
import { MovementHistoryList } from './MovementHistoryList';
import { generateMovementHistoryPDF } from './generate-movement-pdf';

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
	const [isExporting, setIsExporting] = useState(false);
	const shouldLoadHistory = historyModalOpen && Boolean(partId);

	const { data: movementHistory } = useQuery({
		queryKey: inventoryKeys.movements(partId),
		queryFn: () => InventoryService.getMovementHistory(partId),
		enabled: shouldLoadHistory,
	});

	const handleExportPDF = async () => {
		if (!movementHistory) return;
		setIsExporting(true);
		try {
			await generateMovementHistoryPDF(
				partName,
				partSku,
				movementHistory.history,
				movementHistory.stats,
			);
		} finally {
			setIsExporting(false);
		}
	};

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
						<ResponsiveDialogHeader className='flex flex-row items-start justify-between'>
							<div className='flex-1'>
								<ResponsiveDialogTitle>
									{t('inventory.actions.movementHistory')}
								</ResponsiveDialogTitle>
								<ResponsiveDialogDescription>
									{t('inventory.movement.description', { partName, partSku })}
								</ResponsiveDialogDescription>
							</div>
							<Button
								variant='ghost'
								size='icon'
								onClick={handleExportPDF}
								disabled={isExporting}
								className='shrink-0 ml-2'
								title={t('common.export') || 'Export to PDF'}
							>
								{isExporting ? (
									<Loader className='h-4 w-4 animate-spin' />
								) : (
									<Download className='h-4 w-4' />
								)}
							</Button>
						</ResponsiveDialogHeader>

						{}
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
