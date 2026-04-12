import { AcceptInviteForm } from '@/modules/auth';
import { Logo } from '@/shared';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

export function RegisterPage() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const inviteToken = searchParams.get('inviteToken') || '';

	if (!inviteToken) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
				<div className='w-full max-w-md'>
					<Logo />
					<Card>
						<CardHeader className='text-center'>
							<CardTitle className='text-2xl'>
								{t('auth.invite.invalidTitle')}
							</CardTitle>
							<CardDescription>
								{t('auth.invite.invalidDescription')}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild className='w-full'>
								<Link to='/login'>{t('auth.signIn')}</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
			<div className='w-full max-w-md'>
				<Logo />
				<Card>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl'>{t('auth.invite.title')}</CardTitle>
						<CardDescription>{t('auth.invite.subtitle')}</CardDescription>
					</CardHeader>
					<CardContent>
						<AcceptInviteForm inviteToken={inviteToken} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
