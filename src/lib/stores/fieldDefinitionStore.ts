import { writable } from 'svelte/store';
import type { FieldDefinition } from '$lib/types';
import { fieldDefinitionService, type FieldDefinitionPayload } from '$lib/services/fieldDefinitionService';

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
      let fieldsLoaded = false;
      // Use a "peek" method by accessing the store's current value inside an update
      update(state => {
          if (state.fields.length > 0) fieldsLoaded = true;
          return state;
      });

      if (fieldsLoaded) return;

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
    
    /**
     * Creates a new field definition via the API and adds it to the store.
     * @param payload The data for the new field.
     */
    createField: async (payload: FieldDefinitionPayload) => {
        const newField = await fieldDefinitionService.createField(payload);
        update(state => {
            const updatedFields = [...state.fields, newField];
            const updatedMap = new Map(state.fieldMap).set(newField.id, newField);
            return { ...state, fields: updatedFields, fieldMap: updatedMap };
        });
    },

    /**
     * Updates an existing field definition via the API and updates it in the store.
     * @param id The ID of the field to update.
     * @param payload The new data for the field.
     */
    updateField: async (id: number, payload: FieldDefinitionPayload) => {
        const updatedField = await fieldDefinitionService.updateField(id, payload);
        update(state => {
            const fieldIndex = state.fields.findIndex(f => f.id === id);
            if (fieldIndex !== -1) {
                const updatedFields = [...state.fields];
                updatedFields[fieldIndex] = updatedField;
                const updatedMap = new Map(state.fieldMap).set(id, updatedField);
                return { ...state, fields: updatedFields, fieldMap: updatedMap };
            }
            return state; // Return original state if not found
        });
    },

    /**
     * Deletes a field definition via the API and removes it from the store.
     * @param id The ID of the field to delete.
     */
    deleteField: async (id: number) => {
        await fieldDefinitionService.deleteField(id);
        update(state => {
            const updatedFields = state.fields.filter(f => f.id !== id);
            const updatedMap = new Map(state.fieldMap);
            updatedMap.delete(id);
            return { ...state, fields: updatedFields, fieldMap: updatedMap };
        });
    }
  };
}

export const fieldDefinitionStore = createFieldDefinitionStore();
