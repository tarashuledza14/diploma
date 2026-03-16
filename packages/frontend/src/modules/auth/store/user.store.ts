import { EnumToken } from '@/modules/auth/services/auth.enum';
import { User } from '@/shared/interfaces/user.interface';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UserState {
	user: User | null;
	setUser: (user: User | null) => void;
	clearUser: () => void;
}

const getStoredUser = (): User | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	const raw = localStorage.getItem(EnumToken.USER);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as User;
	} catch {
		return null;
	}
};

export const useUserStore = create<UserState>()(
	immer(set => ({
		user: getStoredUser(),
		setUser: (user: User | null) =>
			set(state => {
				state.user = user;
			}),
		clearUser: () =>
			set(state => {
				state.user = null;
			}),
	})),
);
