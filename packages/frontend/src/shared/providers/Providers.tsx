import { router } from '@/app/router';
import { Toaster } from '@/shared/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';

const queryClient = new QueryClient();

export function Providers({ children }: { children?: React.ReactNode }) {
	return (
		<ThemeProvider defaultTheme='system'>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<Toaster richColors />
				{children}
			</QueryClientProvider>
		</ThemeProvider>
	);
}
