import { writable } from 'svelte/store';
import { processInstanceService } from '$lib/services/processInstanceService';
import type { ProcessInstance } from '$lib/types';

interface ProcessListState {
  instances: ProcessInstance[];
  loading: boolean;
  error: string | null;
}

const createProcessListStore = () => {
  const { subscribe, set, update } = writable<ProcessListState>({
    instances: [],
    loading: false,
    error: null,
  });

  const fetchInstances = async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const instances = await processInstanceService.getAllInstances();
      set({ instances, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ instances: [], loading: false, error: message });
    }
  };

  return {
    subscribe,
    fetchInstances,
  };
};

export const processListStore = createProcessListStore();
