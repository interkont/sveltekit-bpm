import { get, post } from './apiService';
import type { User } from '$lib/types';

class UserService {
  /**
   * Fetches the list of all users in the system.
   * @returns A promise that resolves to an array of users.
   */
  async getUsers(): Promise<User[]> {
    try {
      const users = await get<User[]>('/users');
      return users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  // Future methods like createUser, updateUser, deleteUser will go here
}

export const userService = new UserService();
