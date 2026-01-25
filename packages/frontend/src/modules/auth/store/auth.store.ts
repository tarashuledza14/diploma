import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
	// token: string | null;
	// role: string | null;
	// setToken: (token: string | null) => void;
	// setRole: (role: string | null) => void;
}
export const useAuthStore = create<AuthState>()(
	immer(set => ({
		isAuthenticated: false,
		setIsAuthenticated: (isAuthenticated: boolean) =>
			set(state => {
				state.isAuthenticated = isAuthenticated;
			}),
	})),
);
