import { Logo } from '@/shared';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { useTranslation } from 'react-i18next';
import LoginForm from './LoginForm';

export function LoginCard() {
	const { t } = useTranslation();
	return (
		<div className='w-full max-w-md transform scale-115 origin-center'>
			<Logo />
			<Card>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>{t('auth.welcomeBack')}</CardTitle>
					<CardDescription>{t('auth.signInSubtitle')}</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
