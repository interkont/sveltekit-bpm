import { writable } from 'svelte/store';
import type { FieldDefinition } from '$lib/types';
import { fieldDefinitionService } from '$lib/services/fieldDefinitionService';

/**
 * Interface for the Field Definition store state.
 */
interface FieldDefinitionStore {
  fields: FieldDefinition[];
  loading: boolean;
  error: string | null;
  /**
   * A map for quick ID-based lookups.
   */
  fieldMap: Map<number, FieldDefinition>;
}

/**
 * Creates a Svelte store to manage the state of field definitions.
 */
function createFieldDefinitionStore() {
  const { subscribe, set, update } = writable<FieldDefinitionStore>({
    fields: [],
    loading: false,
    error: null,
    fieldMap: new Map(),
  });

  return {
    subscribe,
    /**
     * Fetches all field definitions from the backend and updates the store state.
     * Caches the result to avoid redundant API calls.
     */
    fetchFields: async () => {
      // Use a peek function to check if fields are already loaded without triggering a subscription
      let fieldsLoaded = false;
      update(state => {
        fieldsLoaded = state.fields.length > 0;
        return state;
      });
      
      if (fieldsLoaded) {
        return;
      }

      update(state => ({ ...state, loading: true, error: null }));
      try {
        const fields = await fieldDefinitionService.getAllFields();
        const fieldMap = new Map(fields.map(field => [field.id, field]));
        set({ fields, loading: false, error: null, fieldMap });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error fetching fields.';
        update(state => ({ ...state, error: message, loading: false }));
      }
    },
  };
}

export const fieldDefinitionStore = createFieldDefinitionStore();
