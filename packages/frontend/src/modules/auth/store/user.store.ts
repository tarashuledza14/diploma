import { User } from '@shared';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UserState {
	user: User;
	setUser: (user: User) => void;
}
export const useUserStore = create<UserState>()(
	immer(set => ({
		user: {} as User,
		setUser: (user: User) =>
			set(state => {
				state.user = user;
			}),
	})),
);
