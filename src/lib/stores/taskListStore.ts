import { writable } from 'svelte/store';
import { taskService } from '$lib/services/taskService';
import type { Task } from '$lib/types';

interface TaskListState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const createTaskListStore = () => {
  const { subscribe, set, update } = writable<TaskListState>({
    tasks: [],
    loading: false,
    error: null,
  });

  const fetchTasks = async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const tasks = await taskService.getMyTasks();
      set({ tasks, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ tasks: [], loading: false, error: message });
    }
  };

  return {
    subscribe,
    fetchTasks,
    // We can add methods for add, update, delete later if needed
  };
};

export const taskListStore = createTaskListStore();
