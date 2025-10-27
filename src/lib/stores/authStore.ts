import { writable } from 'svelte/store';
import type { User } from '$lib/types';
import { browser } from '$app/environment';

interface AuthState {
  user: User | null;
  token: string | null;
}

// Helper function to get the initial state from localStorage
const getInitialState = (): AuthState => {
  if (!browser) {
    return { user: null, token: null };
  }
  
  const token = localStorage.getItem('authToken');
  const userJson = localStorage.getItem('authUser');

  if (token && userJson) {
    try {
      const user: User = JSON.parse(userJson);
      return { user, token };
    } catch (error) {
      // If parsing fails, default to a logged-out state
      return { user: null, token: null };
    }
  }

  return { user: null, token: null };
};


const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>(getInitialState());

  return {
    subscribe,
    set: (state: AuthState) => {
      if (browser) {
        if (state.token && state.user) {
          localStorage.setItem('authToken', state.token);
          localStorage.setItem('authUser', JSON.stringify(state.user));
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      }
      set(state);
    },
    updateUser: (updatedData: Partial<User>) => {
      update(current => {
        if (!current.user) return current;

        const mergedUser = { ...current.user, ...updatedData };

        if (updatedData.roles) {
          mergedUser.processRoles = updatedData.roles.map(role => role.name);
        }

        if (browser) {
          localStorage.setItem('authUser', JSON.stringify(mergedUser));
        }
        
        return { ...current, user: mergedUser };
      });
    },
  };
};

export const authStore = createAuthStore();
