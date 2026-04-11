import {
	BlockTeamMemberDialog,
	CreateTeamUserResponse,
	EditTeamMemberDialog,
	InviteFormData,
	InviteTeamMemberDialog,
	TeamHeader,
	TeamTable,
	TeamUser,
	useBlockTeamUserMutation,
	useCreateTeamUserMutation,
	useTeamUsersQuery,
	useUpdateTeamUserMutation,
} from '@/modules/team';
import { useTableSearchParams } from '@/shared';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function TeamPage() {
	const { t } = useTranslation();
	const searchParams = useTableSearchParams();
	const [fullName] = useQueryState('fullName', parseAsString.withDefault(''));
	const teamSearchParams = useMemo(
		() => ({
			...searchParams,
			fullName: fullName.trim() || undefined,
		}),
		[searchParams, fullName],
	);
	const { data, isLoading } = useTeamUsersQuery(teamSearchParams);
	const { mutateAsync: createUser, isPending: isCreating } =
		useCreateTeamUserMutation();
	const { mutateAsync: updateUser, isPending: isUpdating } =
		useUpdateTeamUserMutation();
	const { mutateAsync: blockUser, isPending: isBlocking } =
		useBlockTeamUserMutation();

	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
	const [blockingUser, setBlockingUser] = useState<TeamUser | null>(null);
	const [inviteResult, setInviteResult] =
		useState<CreateTeamUserResponse | null>(null);

	const users = data?.data ?? [];
	const pageCount = data?.pageCount ?? 0;

	const handleInvite = async (formData: InviteFormData) => {
		try {
			const created = await createUser(formData);
			setInviteResult(created);
			setIsInviteOpen(false);
			toast.success(t('team.messages.inviteSuccess'));
		} catch {
			toast.error(t('team.messages.inviteError'));
		}
	};

	const handleUpdate = async (
		userId: string,
		formData: { fullName: string; role: 'ADMIN' | 'MANAGER' | 'MECHANIC' },
	) => {
		try {
			await updateUser({ userId, payload: formData });
			setEditingUser(null);
			toast.success(t('team.messages.updateSuccess'));
		} catch {
			toast.error(t('team.messages.updateError'));
		}
	};

	const handleBlock = async () => {
		if (!blockingUser) {
			return;
		}

		try {
			await blockUser(blockingUser.id);
			setBlockingUser(null);
			toast.success(t('team.messages.blockSuccess'));
		} catch {
			toast.error(t('team.messages.blockError'));
		}
	};

	return (
		<div className='flex flex-col gap-6'>
			<TeamHeader onInviteClick={() => setIsInviteOpen(true)} />

			{inviteResult ? (
				<div className='rounded-md border border-amber-300 bg-amber-50 p-4'>
					<p className='text-sm font-medium text-amber-800'>
						{t('team.messages.temporaryPasswordNotice')}
					</p>
					<p className='mt-1 text-sm text-amber-900'>
						{inviteResult.fullName} ({inviteResult.email})
					</p>
					<p className='mt-2 text-sm'>
						{t('team.fields.temporaryPassword')}:
						<span className='font-mono font-semibold'>
							{inviteResult.temporaryPassword}
						</span>
					</p>
				</div>
			) : null}

			<TeamTable
				data={users}
				pageCount={pageCount}
				onEdit={setEditingUser}
				onBlock={setBlockingUser}
				isLoading={isLoading}
			/>

			<InviteTeamMemberDialog
				open={isInviteOpen}
				onOpenChange={setIsInviteOpen}
				onSubmit={handleInvite}
				isSubmitting={isCreating}
			/>

			<EditTeamMemberDialog
				open={Boolean(editingUser)}
				onOpenChange={open => {
					if (!open) {
						setEditingUser(null);
					}
				}}
				selectedUser={editingUser}
				onSubmit={handleUpdate}
				isSubmitting={isUpdating}
			/>

			<BlockTeamMemberDialog
				open={Boolean(blockingUser)}
				onOpenChange={open => {
					if (!open) {
						setBlockingUser(null);
					}
				}}
				selectedUser={blockingUser}
				onConfirm={handleBlock}
				isLoading={isBlocking}
			/>
		</div>
	);
}
