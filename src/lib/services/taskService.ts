import { get } from './apiService';
import type { Task } from '$lib/types';

class TaskService {
  /**
   * Fetches the list of tasks assigned to the currently authenticated user.
   * @returns A promise that resolves to an array of tasks.
   */
  async getMyTasks(): Promise<Task[]> {
    try {
      const tasks = await get<Task[]>('/tasks/my-tasks');
      return tasks;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Re-throw the error to be handled by the store or component
      throw error;
    }
  }
}

export const taskService = new TaskService();
