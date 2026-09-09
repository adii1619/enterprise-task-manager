import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ApiError,
  fetchCurrentUser,
  loginUser,
  registerUser,
} from '@/lib/api';
import { AuthUser } from '@/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  hydrateSession: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser({ name, email, password });
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser({ email, password });
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },

      hydrateSession: async () => {
        if (!useAuthStore.getState().token) return;
        set({ isLoading: true, error: null });
        try {
          const response = await fetchCurrentUser();
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            set({ token: null, user: null, isAuthenticated: false });
          }
          set({ isLoading: false, error: getErrorMessage(error) });
        }
      },

      logout: () => set({ token: null, user: null, isAuthenticated: false, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'enterprise-task-manager-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication request failed';
}