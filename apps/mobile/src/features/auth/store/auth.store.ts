import { create } from 'zustand';
import { User } from '@know-your-route/contracts';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function getWebStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

async function persistToken(token: string | null): Promise<void> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      if (token) {
        webStorage.setItem(TOKEN_KEY, token);
      } else {
        webStorage.removeItem(TOKEN_KEY);
      }
      return;
    }

    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // best-effort
  }
}

async function persistUser(user: User | null): Promise<void> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      if (user) {
        webStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        webStorage.removeItem(USER_KEY);
      }
      return;
    }

    if (user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch {
    // best-effort
  }
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true, isLoading: false });
    persistToken(token);
    persistUser(user);
  },

  updateUser: (partial) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...partial } : null;
      if (updated) persistUser(updated);
      return { user: updated };
    }),

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    persistToken(null);
    persistUser(null);
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        const token = webStorage.getItem(TOKEN_KEY);
        const userJson = webStorage.getItem(USER_KEY);
        if (token && userJson) {
          const user = JSON.parse(userJson) as User;
          set({ token, user, isAuthenticated: true, isLoading: false });
          return;
        }
        set({ isLoading: false });
        return;
      }

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
