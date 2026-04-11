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

export interface InviteFormData {
	email: string;
	fullName?: string;
	role: UserRole;
}

interface InviteTeamMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: InviteFormData) => Promise<void>;
	isSubmitting?: boolean;
}

export function InviteTeamMemberDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
}: InviteTeamMemberDialogProps) {
	const { t } = useTranslation();

	const schema = z.object({
		email: z.email(t('team.form.errors.invalidEmail')),
		fullName: z.string().trim().optional(),
		role: z.enum(['ADMIN', 'MANAGER', 'MECHANIC']),
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<InviteFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			fullName: '',
			role: 'MECHANIC',
		},
	});

	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	const role = watch('role');

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>
						{t('team.dialogs.inviteTitle')}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{t('team.dialogs.inviteDescription')}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<form
					className='space-y-4'
					onSubmit={handleSubmit(values => onSubmit(values))}
				>
					<div className='space-y-2'>
						<Label htmlFor='team-email'>{t('common.email')} *</Label>
						<Input id='team-email' type='email' {...register('email')} />
						{errors.email && (
							<p className='text-xs text-destructive'>{errors.email.message}</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='team-fullName'>{t('team.fields.fullName')}</Label>
						<Input id='team-fullName' {...register('fullName')} />
					</div>

					<div className='space-y-2'>
						<Label>{t('team.fields.role')} *</Label>
						<Select
							value={role}
							onValueChange={value => setValue('role', value as UserRole)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t('team.form.placeholders.role')} />
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
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 size-4 animate-spin' />
									{t('team.actions.inviting')}
								</>
							) : (
								t('team.actions.invite')
							)}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
