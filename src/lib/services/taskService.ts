import { get, post } from './apiService';
import type { Task, TaskFormDefinition } from '$lib/types';

// Interface for the payload to complete a task
interface CompleteTaskPayload {
  action: string;
  comments: string;
  formData: Record<string, any>;
}

class TaskService {
  /**
   * Fetches the list of tasks assigned to the currently authenticated user.
   */
  async getMyTasks(): Promise<Task[]> {
    try {
      const tasks = await get<Task[]>('/tasks/my-tasks');
      return tasks;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  /**
   * Fetches the form definition for a specific task.
   * @param taskId The ID of the task.
   */
  async getTaskForm(taskId: number): Promise<TaskFormDefinition> {
    try {
      const formDef = await get<TaskFormDefinition>(`/tasks/${taskId}/form`);
      return formDef;
    } catch (error) {
      console.error(`Failed to fetch form for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Submits the data to complete a task.
   * @param taskId The ID of the task to complete.
   * @param payload The data required to complete the task.
   */
  async completeTask(taskId: number, payload: CompleteTaskPayload): Promise<void> {
    try {
      await post(`/tasks/${taskId}/complete`, payload);
    } catch (error) {
      console.error(`Failed to complete task ${taskId}:`, error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
