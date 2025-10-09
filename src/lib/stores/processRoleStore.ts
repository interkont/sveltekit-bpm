import { derived } from 'svelte/store';
import { userStore } from './userStore';
import type { ProcessRole } from '$lib/types';

/**
 * processRoleStore is now a derived store.
 * Its value is automatically calculated based on the userStore.
 * It extracts all unique process roles from the complete user list.
 */
export const processRoleStore = derived<typeof userStore, ProcessRole[]>(
  userStore,
  ($userStore, set) => {
    if ($userStore.loading) {
      // While users are loading, we can provide an empty list
      set([]);
      return;
    }

    const rolesMap = new Map<string, ProcessRole>();

    $userStore.users.forEach(user => {
      // The user object from the API has a 'roles' array of objects
      user.roles?.forEach(role => {
        if (!rolesMap.has(role.name)) {
          rolesMap.set(role.name, {
            key: role.name, // Using name as key for simplicity as per original design
            name: role.name,
            description: role.description || `Users with the ${role.name} role`
          });
        }
      });
    });
    
    set(Array.from(rolesMap.values()));
  },
  [] // Initial value is an empty array
);

// NOTE: The manual manipulation methods (add, update, delete) for process roles
// have been removed. This logic will now be handled by API calls and re-fetching users,
// or by more advanced local data management in userStore if needed.
