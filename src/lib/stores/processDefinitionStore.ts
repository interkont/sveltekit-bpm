import { writable } from 'svelte/store';
import { processDefinitionService } from '$lib/services/processDefinitionService';
import type { ProcessDefinition } from '$lib/types';

interface ProcessDefinitionState {
  definitions: ProcessDefinition[];
  loading: boolean;
  error: string | null;
}

const createProcessDefinitionStore = () => {
  const { subscribe, set, update } = writable<ProcessDefinitionState>({
    definitions: [],
    loading: false,
    error: null,
  });

  const fetchDefinitions = async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const definitions = await processDefinitionService.getAvailableProcesses();
      set({ definitions, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ definitions: [], loading: false, error: message });
    }
  };

  return {
    subscribe,
    fetchDefinitions,
  };
};

export const processDefinitionStore = createProcessDefinitionStore();
