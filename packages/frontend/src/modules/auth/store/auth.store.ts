import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    isAuthenticated: false,
    setIsAuthenticated: (isAuthenticated: boolean) =>
      set((state) => {
        state.isAuthenticated = isAuthenticated;
      }),
  })),
);
