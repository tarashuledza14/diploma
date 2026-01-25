import { Header } from '@/layouts/main-layout/header/Header';
import { Sidebar } from '@/layouts/main-layout/header/Sidebar';
import { Outlet } from 'react-router-dom';

// TODO: Import useAuthStore to check if user is authenticated
// TODO: If not authenticated, redirect to /login

export function MainLayout() {
	// TODO: Check authentication status
	// const { isAuthenticated, isLoading } = useAuthStore()
	// const router = useRouter()

	// useEffect(() => {
	//   if (!isLoading && !isAuthenticated) {
	//     router.push('/login')
	//   }
	// }, [isAuthenticated, isLoading, router])

	// TODO: Show loading skeleton while checking auth
	// if (isLoading) return <LayoutSkeleton />

	return (
		<div className='flex h-screen overflow-hidden bg-background'>
			<Sidebar />

			<div className='flex flex-1 flex-col overflow-hidden'>
				<Header />

				<main className='flex-1 overflow-auto p-6'>
					<Outlet />
				</main>
			</div>

			{/* AI Assistant Floating Widget */}
			{/* <AIAssistantWidget /> */}
		</div>
	);
}
