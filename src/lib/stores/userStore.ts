import { writable } from 'svelte/store';
import type { User } from '$lib/types';
import { users as initialUsers } from '$lib/data/users';

const createUserStore = () => {
  const { subscribe, set, update } = writable<User[]>(initialUsers);

  return {
    subscribe,

    add: (user: User) => {
      update(users => [...users, user]);
    },

    update: (updatedUser: User) => {
      update(users => users.map(user => 
        user.uid === updatedUser.uid ? updatedUser : user
      ));
    },

    delete: (uid: string) => {
      update(users => users.filter(user => user.uid !== uid));
    },

    set: (newUsers: User[]) => {
      set(newUsers);
    },

    updateRoleAssignments: (roleKey: string, assignedUids: string[]) => {
      update(users => {
        return users.map(user => {
          const hasRole = user.processRoles.includes(roleKey);
          const shouldHaveRole = assignedUids.includes(user.uid);

          if (shouldHaveRole && !hasRole) {
            return { ...user, processRoles: [...user.processRoles, roleKey] };
          } else if (!shouldHaveRole && hasRole) {
            return { ...user, processRoles: user.processRoles.filter(r => r !== roleKey) };
          }

          return user;
        });
      });
    }
  };
};

export const userStore = createUserStore();
