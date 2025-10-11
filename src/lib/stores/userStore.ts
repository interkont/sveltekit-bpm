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

  const fetchUserById = async (userId: number) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      let user = await userService.getUserById(userId);
      // Transform data to ensure compatibility with components 
      // expecting `processRoles` as an array of strings.
      user = {
        ...user,
        processRoles: user.roles ? user.roles.map(r => r.name) : []
      };
      update(state => ({ ...state, loading: false }));
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      update(state => ({ ...state, loading: false, error: message }));
      throw error; // Re-throw so the component knows about the failure
    }
  };

  const createUser = async (userData: Omit<User, 'id'>) => {
    update(state => ({ ...state, loading: true }));
    try {
      await userService.createUser(userData);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      update(state => ({ ...state, loading: false, error: message }));
      throw error; // Re-throw to inform the component
    }
  };

  const updateUser = async (userId: number, userData: Partial<User>) => {
    update(state => ({ ...state, loading: true }));
    try {
      await userService.updateUser(userId, userData);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      update(state => ({ ...state, loading: false, error: message }));
      throw error; // Re-throw to inform the component
    }
  };

  const deleteUser = async (userId: number) => {
    update(state => ({ ...state, loading: true }));
    try {
      await userService.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      update(state => ({ ...state, loading: false, error: message }));
      throw error; // Re-throw to inform the component
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
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};

export const userStore = createUserStore();
