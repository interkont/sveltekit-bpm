import { writable } from 'svelte/store';
import type { User } from '$lib/types';
import { userService } from '$lib/services/userService';

// Define the shape of our state
interface UserStoreState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const createUserStore = () => {
  const { subscribe, set, update } = writable<UserStoreState>({
    users: [],
    loading: false,
    error: null,
  });

  const fetchUsers = async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      let users = await userService.getUsers();
      // Transform data to ensure compatibility with components expecting `processRoles` as an array of strings.
      users = users.map(user => ({
        ...user,
        processRoles: user.roles ? user.roles.map(r => r.name) : []
      }));
      set({ users, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ users: [], loading: false, error: message });
    }
  };
  
  // Future methods for local state manipulation can be added here
  // For example:
  // const addUser = (user: User) => update(state => ({...state, users: [...state.users, user]}));
  // const updateUser = (user: User) => update(state => ({...state, users: state.users.map(u => u.id === user.id ? user : u)}));
  // const deleteUser = (userId: number) => update(state => ({...state, users: state.users.filter(u => u.id !== userId)}));

  return {
    subscribe,
    fetchUsers,
    // addUser,
    // updateUser,
    // deleteUser,
  };
};

export const userStore = createUserStore();
