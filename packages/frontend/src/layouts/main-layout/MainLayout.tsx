import { useAppBrandingQuery } from '@/modules/app-settings';
import { useUserStore } from '@/modules/auth';
import { SidebarInset, SidebarProvider } from '@/shared';
import { Navigate, Outlet } from 'react-router-dom';
import { Header } from './header/Header';
import { AppSidebar } from './header/Sidebar';

export function MainLayout() {
	const user = useUserStore(state => state.user);
	const { data: branding, isLoading: isBrandingLoading } =
		useAppBrandingQuery();

	if (
		user?.role === 'ADMIN' &&
		!isBrandingLoading &&
		branding !== undefined &&
		!branding.isOnboardingCompleted
	) {
		return <Navigate to='/onboarding' replace />;
	}

	return (
		<div className='flex h-dvh min-h-0 w-full overflow-hidden bg-background'>
			<SidebarProvider className='h-full min-h-0 overflow-hidden'>
				<AppSidebar />
				<SidebarInset>
					<Header />
					<main className='flex-1 min-h-0 overflow-x-hidden overflow-y-auto p-4 py-6 sm:px-6'>
						<Outlet />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
