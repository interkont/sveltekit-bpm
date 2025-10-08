import { writable } from 'svelte/store';
import type { Task, ProcessInstance, TaskFormDefinition } from '$lib/types';
import { processInstanceService } from '$lib/services/processInstanceService';
import { taskService } from '$lib/services/taskService';

interface TaskDetailState {
  isOpen: boolean;
  task: Task | null;
  processInstance: ProcessInstance | null;
  formDefinition: TaskFormDefinition | null; // <-- Añadido
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailState = {
  isOpen: false,
  task: null,
  processInstance: null,
  formDefinition: null,
  loading: false,
  error: null,
};

const createTaskDetailStore = () => {
  const { subscribe, set, update } = writable<TaskDetailState>(initialState);

  const show = async (task: Task) => {
    update(state => ({ 
      ...initialState,
      isOpen: true, 
      loading: true, 
      task: task, 
    }));

    try {
      // Fetch both process details and form definition in parallel
      const [instanceDetails, formDef] = await Promise.all([
        processInstanceService.getInstanceDetails(task.processInstanceId),
        taskService.getTaskForm(task.taskId)
      ]);
      
      set({ 
        isOpen: true, 
        loading: false, 
        task: task, 
        processInstance: instanceDetails, 
        formDefinition: formDef,
        error: null 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ 
        ...initialState,
        isOpen: true,
        task: task, 
        error: message 
      });
    }
  };

  const hide = () => {
    set(initialState);
  };

  return {
    subscribe,
    show,
    hide,
  };
};

export const taskDetailStore = createTaskDetailStore();
