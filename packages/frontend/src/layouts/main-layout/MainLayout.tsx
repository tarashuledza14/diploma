import { SidebarInset, SidebarProvider } from '@/shared'; // Імпорти з твоєї бібліотеки компонентів
import { Outlet } from 'react-router-dom';
import { Header } from './header/Header';
import { AppSidebar } from './header/Sidebar';

export function MainLayout() {
	return (
		<div className='flex h-dvh min-h-0 w-full overflow-hidden bg-background'>
			<SidebarProvider className='h-full min-h-0 overflow-hidden'>
				{/* 1. Сайдбар */}
				<AppSidebar />
				<SidebarInset>
					{/* 2. Основна область (SidebarInset замінює div flex-1) */}
					{/* <SidebarInset> */}
					{/* <SidebarInset className='max-w-full'> */}
					{/* <div className='flex flex-1 flex-col'> */}
					<Header />

					{/* Основний контент сторінки */}
					<main className='flex-1 min-h-0 overflow-x-hidden overflow-y-auto p-4 py-6 sm:px-6'>
						<Outlet />
					</main>
					{/* </div> */}
				</SidebarInset>
				{/* </SidebarInset> */}
			</SidebarProvider>
		</div>
	);
}
