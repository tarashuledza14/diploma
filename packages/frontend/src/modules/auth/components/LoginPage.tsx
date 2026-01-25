'use client';

import { Logo } from '@/shared';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { LoginForm } from './LoginForm';

export function LoginPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
			<div className='w-full max-w-md transform scale-115 origin-center'>
				<Logo />
				<Card>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl'>Welcome back</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<LoginForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
