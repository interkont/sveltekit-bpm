import { writable } from 'svelte/store';
import type { User } from '$lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
}

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
  });

  return {
    subscribe,
    set,
    /**
     * Updates the user object in the store by merging new data.
     * This is useful for partial updates, like after a profile change.
     * @param updatedData A partial User object with the fields to update.
     */
    updateUser: (updatedData: Partial<User>) => {
      update(current => {
        if (!current.user) return current; // Do nothing if there's no user

        const mergedUser = { ...current.user, ...updatedData };

        // Ensure roles are handled correctly if they are part of the update
        if (updatedData.roles) {
          mergedUser.processRoles = updatedData.roles.map(role => role.name);
        }
        
        return { ...current, user: mergedUser };
      });
    },
  };
};

export const authStore = createAuthStore();
