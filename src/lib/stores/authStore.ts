import { writable } from 'svelte/store';
import type { User } from '$lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
}

const createAuthStore = () => {
  const { subscribe, set } = writable<AuthState>({
    user: null,
    token: null,
  });

  return {
    subscribe,
    set,
  };
};

export const authStore = createAuthStore();
