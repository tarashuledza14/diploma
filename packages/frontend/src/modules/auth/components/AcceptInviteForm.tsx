import { AuthAPI } from '@/modules/auth/api/auth.api';
import { saveToStorage } from '@/modules/auth/services/token.service';
import { useUserStore } from '@/modules/auth/store/user.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AcceptInviteFormProps {
	inviteToken: string;
}

export function AcceptInviteForm({ inviteToken }: AcceptInviteFormProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const setUser = useUserStore(state => state.setUser);

	const [fullName, setFullName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const { mutate: acceptInvite, isPending } = useMutation({
		mutationKey: ['accept-invite'],
		mutationFn: () =>
			AuthAPI.acceptInvite({
				token: inviteToken,
				password,
				fullName: fullName.trim() || undefined,
			}),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!password || !confirmPassword) {
			setError(t('auth.invite.errors.requiredFields'));
			return;
		}

		if (password.length < 8) {
			setError(t('auth.invite.errors.minLength'));
			return;
		}

		if (password !== confirmPassword) {
			setError(t('auth.invite.errors.passwordMismatch'));
			return;
		}

		acceptInvite(undefined, {
			onSuccess: data => {
				saveToStorage(data);
				setUser(data.user);
				toast.success(t('auth.invite.messages.success'));
				navigate('/');
			},
			onError: (apiError: any) => {
				setError(
					apiError?.response?.data?.message ||
						t('auth.invite.errors.acceptFailed'),
				);
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			{error ? (
				<div className='p-3 text-sm text-destructive bg-destructive/10 rounded-md'>
					{error}
				</div>
			) : null}

			<div className='space-y-2'>
				<Label htmlFor='invite-fullName'>{t('team.fields.fullName')}</Label>
				<Input
					id='invite-fullName'
					placeholder={t('auth.invite.placeholders.fullName')}
					value={fullName}
					onChange={e => setFullName(e.target.value)}
					disabled={isPending}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='invite-password'>{t('common.password')}</Label>
				<Input
					id='invite-password'
					type='password'
					placeholder={t('auth.invite.placeholders.password')}
					value={password}
					onChange={e => setPassword(e.target.value)}
					disabled={isPending}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='invite-confirmPassword'>
					{t('auth.invite.confirmPassword')}
				</Label>
				<Input
					id='invite-confirmPassword'
					type='password'
					placeholder={t('auth.invite.placeholders.confirmPassword')}
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
					disabled={isPending}
					required
				/>
			</div>

			<Button type='submit' className='w-full' disabled={isPending}>
				{isPending ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						{t('auth.invite.submitting')}
					</>
				) : (
					t('auth.invite.submit')
				)}
			</Button>
		</form>
	);
}
