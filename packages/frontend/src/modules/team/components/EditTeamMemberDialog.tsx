import {
	Button,
	Input,
	Label,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { UserRole } from '@/shared/interfaces/user.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TeamUser } from '../interfaces/team-user.interface';

interface EditFormData {
	fullName: string;
	role: UserRole;
}

interface EditTeamMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUser: TeamUser | null;
	onSubmit: (userId: string, data: EditFormData) => Promise<void>;
	isSubmitting?: boolean;
}

export function EditTeamMemberDialog({
	open,
	onOpenChange,
	selectedUser,
	onSubmit,
	isSubmitting,
}: EditTeamMemberDialogProps) {
	const { t } = useTranslation();

	const schema = z.object({
		fullName: z.string().trim().min(2, t('team.form.errors.fullNameRequired')),
		role: z.enum(['ADMIN', 'MANAGER', 'MECHANIC']),
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<EditFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: '',
			role: 'MECHANIC',
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		reset({
			fullName: selectedUser?.fullName ?? '',
			role: selectedUser?.role ?? 'MECHANIC',
		});
	}, [open, reset, selectedUser]);

	const role = watch('role');

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>
						{t('team.dialogs.editTitle')}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{t('team.dialogs.editDescription')}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<form
					className='space-y-4'
					onSubmit={handleSubmit(values =>
						selectedUser
							? onSubmit(selectedUser.id, values)
							: Promise.resolve(),
					)}
				>
					<div className='space-y-2'>
						<Label>{t('common.email')}</Label>
						<Input value={selectedUser?.email ?? ''} disabled />
						<p className='text-xs text-muted-foreground'>
							{t('team.form.emailImmutable')}
						</p>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='edit-team-fullName'>
							{t('team.fields.fullName')}
						</Label>
						<Input id='edit-team-fullName' {...register('fullName')} />
						{errors.fullName && (
							<p className='text-xs text-destructive'>
								{errors.fullName.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label>{t('team.fields.role')}</Label>
						<Select
							value={role}
							onValueChange={value => setValue('role', value as UserRole)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='ADMIN'>ADMIN</SelectItem>
								<SelectItem value='MANAGER'>MANAGER</SelectItem>
								<SelectItem value='MECHANIC'>MECHANIC</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<ResponsiveDialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
						>
							{t('common.cancel')}
						</Button>
						<Button type='submit' disabled={isSubmitting || !selectedUser}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 size-4 animate-spin' />
									{t('common.savingChanges')}
								</>
							) : (
								t('common.saveChanges')
							)}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
