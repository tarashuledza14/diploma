import { DEFAULT_APP_NAME, useAppBrandingQuery } from '@/modules/app-settings';
import { getAccessToken } from '@/modules/auth';
import { Car } from 'lucide-react';

export default function Logo() {
	const hasAccessToken = Boolean(getAccessToken());
	const { data: branding } = useAppBrandingQuery({
		enabled: hasAccessToken,
	});
	const appName = branding?.appName?.trim() || DEFAULT_APP_NAME;
	const logoUrl = branding?.logoUrl?.trim() || null;

	return (
		<div className='flex items-center justify-center gap-2 mb-8'>
			<div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-primary'>
				{logoUrl ? (
					<img
						src={logoUrl}
						alt={appName}
						className='h-full w-full object-cover'
					/>
				) : (
					<Car className='h-6 w-6 text-primary-foreground' />
				)}
			</div>
			<span className='text-2xl font-bold'>{appName}</span>
		</div>
	);
}
