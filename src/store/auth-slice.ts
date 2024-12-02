import { StateCreator } from 'zustand';
import { BlueSkyCredentials } from '../types/bluesky';
import { cookies } from '../lib/cookies';

export interface AuthState {
  credentials: BlueSkyCredentials | null;
  isAuthenticated: boolean;
  isAutoLogging: boolean;
}

export interface AuthActions {
  setCredentials: (creds: BlueSkyCredentials) => void;
  setAutoLogging: (isLogging: boolean) => void;
  logout: () => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const createAuthSlice: StateCreator<AuthSlice> = (set) => {
  // Try to get stored credentials
  const storedCredentials = cookies.get();

  return {
    // Initial state
    credentials: storedCredentials,
    isAuthenticated: false, // Start as false even with stored credentials
    isAutoLogging: false,

    // Actions
    setCredentials: (creds) => {
      cookies.set(creds);
      set({ credentials: creds, isAuthenticated: true });
    },

    setAutoLogging: (isLogging) => set({ isAutoLogging: isLogging }),

    logout: () => {
      cookies.remove();
      set({
        credentials: null,
        isAuthenticated: false
      });
    }
  };
}

export default createAuthSlice;
