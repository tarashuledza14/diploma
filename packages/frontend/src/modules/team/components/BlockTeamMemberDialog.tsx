import { DeleteConfirmationModal } from '@/shared';
import { useTranslation } from 'react-i18next';
import { TeamUser } from '../interfaces/team-user.interface';

interface BlockTeamMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUser: TeamUser | null;
	onConfirm: () => Promise<void>;
	isLoading?: boolean;
}

export function BlockTeamMemberDialog({
	open,
	onOpenChange,
	selectedUser,
	onConfirm,
	isLoading,
}: BlockTeamMemberDialogProps) {
	const { t } = useTranslation();

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title={t('team.dialogs.blockTitle')}
			description={t('team.dialogs.blockDescription')}
			confirmText={t('team.actions.block')}
			cancelText={t('common.cancel')}
			loadingText={t('common.deleting')}
			isLoading={isLoading}
			onConfirm={() => {
				void onConfirm();
			}}
		>
			{selectedUser ? (
				<div>
					<p className='font-medium'>{selectedUser.fullName}</p>
					<p className='text-sm text-muted-foreground'>{selectedUser.email}</p>
				</div>
			) : null}
		</DeleteConfirmationModal>
	);
}
