import { writable } from 'svelte/store';
import type { ProcessInstance } from '$lib/types';
import { processInstanceService } from '$lib/services/processInstanceService';

interface ProcessDetailState {
  isOpen: boolean;
  process: ProcessInstance | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProcessDetailState = {
  isOpen: false,
  process: null,
  loading: false,
  error: null,
};

const createProcessDetailStore = () => {
  const { subscribe, set, update } = writable<ProcessDetailState>(initialState);

  const show = async (instanceId: number) => {
    update(state => ({ ...state, isOpen: true, loading: true, error: null, process: null }));
    try {
      const processData = await processInstanceService.getInstanceDetails(instanceId);
      set({ isOpen: true, loading: false, error: null, process: processData });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ isOpen: true, loading: false, error: message, process: null });
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

export const processDetailStore = createProcessDetailStore();
