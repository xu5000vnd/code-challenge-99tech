import { create } from 'zustand';
import { authAPI, userAPI } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types';

// Helper function to extract error message from API response
const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data?.error) {
    // Handle string error: { error: "Invalid credentials" }
    if (typeof error.response.data.error === 'string') {
      return error.response.data.error;
    }
    // Handle array error: { error: ["Email is required", "Password is required"] }
    if (Array.isArray(error.response.data.error)) {
      return error.response.data.error.join(', ');
    }
  }
  // Handle message field: { message: "Something went wrong" }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // Handle network errors
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  // Handle timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  return defaultMessage;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.login(data);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Login failed. Please try again.');
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.register(data);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Registration failed. Please try again.');
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const { refreshToken } = get();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  logoutAll: async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await userAPI.getMe();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      console.error('Fetch user error:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
      // Fetch user data
      get().fetchUser();
    }
  },
}));

