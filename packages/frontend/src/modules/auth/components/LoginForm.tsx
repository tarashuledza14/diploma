import { AuthAPI } from '@/modules/auth/api/auth.api';
import { useUserStore } from '@/modules/auth/store/user.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function LoginForm() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const setUser = useUserStore(state => state.setUser);
	const { mutate: login } = useMutation({
		mutationKey: ['login'],
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			AuthAPI.login(email, password),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		login(
			{ email, password },
			{
				onError: (error: any) => {
					setError(
						error.response?.data?.message || t('auth.errors.loginFailed'),
					);
				},
				onSuccess: data => {
					if (email && password) {
						toast.success(t('auth.messages.loggedInSuccessfully'));
						setUser(data?.user);
						navigate('/');
					} else {
						setError(t('auth.errors.enterEmailAndPassword'));
					}
				},
			},
		);

		setIsLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			{error && (
				<div className='p-3 text-sm text-destructive bg-destructive/10 rounded-md'>
					{error}
				</div>
			)}

			<div className='space-y-2'>
				<Label htmlFor='email'>{t('common.email')}</Label>
				<Input
					id='email'
					type='email'
					placeholder={t('auth.placeholders.email')}
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
					disabled={isLoading}
				/>
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label htmlFor='password'>{t('common.password')}</Label>
				</div>
				<div className='relative'>
					<Input
						id='password'
						type={showPassword ? 'text' : 'password'}
						placeholder={t('auth.placeholders.password')}
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						disabled={isLoading}
						className='pr-10'
					/>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
						onClick={() => setShowPassword(!showPassword)}
						disabled={isLoading}
					>
						{showPassword ? (
							<EyeOff className='h-4 w-4 text-muted-foreground' />
						) : (
							<Eye className='h-4 w-4 text-muted-foreground' />
						)}
						<span className='sr-only'>
							{showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
						</span>
					</Button>
				</div>
			</div>

			<Button type='submit' className='w-full' disabled={isLoading}>
				{isLoading ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						{t('auth.signingIn')}
					</>
				) : (
					t('auth.signIn')
				)}
			</Button>
		</form>
	);
}

export default LoginForm;
