import { get, post, put, del } from './apiService';
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

  /**
   * Fetches a single user by their ID.
   * @param userId The ID of the user to fetch.
   * @returns A promise that resolves to the user object.
   */
  async getUserById(userId: number): Promise<User> {
    try {
      const user = await get<User>(`/users/${userId}`);
      return user;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new user.
   * @param userData - The data for the new user.
   * @returns A promise that resolves to the newly created user.
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const newUser = await post<User>('/users', userData);
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Updates an existing user.
   * @param userId - The ID of the user to update.
   * @param userData - The data to update.
   * @returns A promise that resolves to the updated user.
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await put<User>(`/users/${userId}`, userData);
      return updatedUser;
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a user.
   * @param userId - The ID of the user to delete.
   * @returns A promise that resolves when the user is deleted.
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await del(`/users/${userId}`);
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
