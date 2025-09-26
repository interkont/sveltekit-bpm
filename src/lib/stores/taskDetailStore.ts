import { writable } from 'svelte/store';
import type { Task, ProcessInstance } from '$lib/types';
import { processInstanceService } from '$lib/services/processInstanceService';

interface TaskDetailState {
  isOpen: boolean;
  task: Task | null;
  processInstance: ProcessInstance | null; // <-- Añadido para guardar los detalles del proceso
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailState = {
  isOpen: false,
  task: null,
  processInstance: null,
  loading: false,
  error: null,
};

const createTaskDetailStore = () => {
  const { subscribe, set, update } = writable<TaskDetailState>(initialState);

  const show = async (task: Task) => {
    // 1. Inmediatamente abre el panel en estado de carga con la info básica de la tarea
    update(state => ({ 
      ...state, 
      isOpen: true, 
      loading: true, 
      task: task, 
      processInstance: null, 
      error: null 
    }));

    try {
      // 2. Busca los detalles completos de la instancia del proceso
      const instanceDetails = await processInstanceService.getInstanceDetails(task.processInstanceId);
      
      // 3. Actualiza el store con los datos completos
      set({ 
        isOpen: true, 
        loading: false, 
        task: task, 
        processInstance: instanceDetails, 
        error: null 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ 
        isOpen: true, 
        loading: false, 
        task: task, 
        processInstance: null, 
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
