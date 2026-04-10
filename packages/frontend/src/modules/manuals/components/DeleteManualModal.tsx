import { DeleteConfirmationModal } from '@/shared';
import { useTranslation } from 'react-i18next';
import type { ManualItem } from '../interfaces/manual.interface';

interface DeleteManualModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedManual: ManualItem | null;
	isDeleting: boolean;
	onConfirm: () => void;
}

export function DeleteManualModal({
	open,
	onOpenChange,
	selectedManual,
	isDeleting,
	onConfirm,
}: DeleteManualModalProps) {
	const { t } = useTranslation();

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title={t('manuals.delete.title')}
			description={t('manuals.delete.description')}
			confirmText={t('manuals.delete.confirm')}
			cancelText={t('common.cancel')}
			loadingText={t('manuals.delete.deleting')}
			isLoading={isDeleting}
			onConfirm={onConfirm}
		>
			{selectedManual && (
				<div className='min-w-0'>
					<p className='truncate text-sm font-medium'>
						{selectedManual.filename}
					</p>
					<p className='text-xs text-muted-foreground'>
						{selectedManual.carModel || t('manuals.unknownModel')}
					</p>
				</div>
			)}
		</DeleteConfirmationModal>
	);
}
