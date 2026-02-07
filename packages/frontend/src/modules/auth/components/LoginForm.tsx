import { AuthAPI } from '@/modules/auth/api/auth.api';
import { useUserStore } from '@/modules/auth/store/user.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function LoginForm() {
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
					setError(error.response?.data?.message || 'Login failed');
				},
				onSuccess: data => {
					if (email && password) {
						toast.success('Logged in successfully');
						setUser(data?.user);
						navigate('/');
					} else {
						setError('Please enter email and password');
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
				<Label htmlFor='email'>Email</Label>
				<Input
					id='email'
					type='email'
					placeholder='name@company.com'
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
					disabled={isLoading}
				/>
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label htmlFor='password'>Password</Label>
				</div>
				<div className='relative'>
					<Input
						id='password'
						type={showPassword ? 'text' : 'password'}
						placeholder='Enter your password'
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
							{showPassword ? 'Hide password' : 'Show password'}
						</span>
					</Button>
				</div>
			</div>

			<Button type='submit' className='w-full' disabled={isLoading}>
				{isLoading ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Signing in...
					</>
				) : (
					'Sign in'
				)}
			</Button>
		</form>
	);
}

export default LoginForm;
