import { SidebarInset, SidebarProvider } from '@/shared'; // Імпорти з твоєї бібліотеки компонентів
import { Outlet } from 'react-router-dom';
import { Header } from './header/Header';
import { AppSidebar } from './header/Sidebar';

export function MainLayout() {
	return (
		<div className='flex min-h-dvh w-full bg-background'>
			<SidebarProvider>
				{/* 1. Сайдбар */}
				<AppSidebar />
				<SidebarInset>
					{/* 2. Основна область (SidebarInset замінює div flex-1) */}
					{/* <SidebarInset> */}
					{/* <SidebarInset className='max-w-full'> */}
					{/* <div className='flex flex-1 flex-col'> */}
					<Header />

					{/* Основний контент сторінки */}
					<main className='flex-1 p-4 sm:px-6 py-6 overflow-auto'>
						<Outlet />
					</main>
					{/* </div> */}
				</SidebarInset>
				{/* </SidebarInset> */}
			</SidebarProvider>
		</div>
	);
}
