import { apiService } from './apiService';
import type { User } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const data = await apiService.get('/users');
      return data as User[]; // Assuming the API returns an array of User objects
    } catch (error) {
      console.error('Error fetching users:', error);
      // Depending on your error handling strategy, you might throw the error,
      // return an empty array, or return a specific error object.
      throw error; // Re-throw the error to be handled by the caller
    }
  },

  // You can add other user-related functions here, e.g.,
  // getUserById: async (id: string): Promise<User> => { ... }
  // createUser: async (userData: Omit<User, 'uid'>): Promise<User> => { ... }
  // updateUser: async (id: string, userData: Partial<User>): Promise<User> => { ... }
  // deleteUser: async (id: string): Promise<void> => { ... }
};