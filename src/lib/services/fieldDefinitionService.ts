import { get } from './apiService';
import type { FieldDefinition } from '$lib/types';

/**
 * Service for managing field definitions from the data library.
 */
export const fieldDefinitionService = {
  /**
   * Fetches all available field definitions from the backend.
   * @returns A promise that resolves to an array of FieldDefinition objects.
   */
  async getAllFields(): Promise<FieldDefinition[]> {
    try {
      const fields = await get<FieldDefinition[]>('/fields');
      return fields;
    } catch (error) {
      console.error('Error fetching field definitions:', error);
      // The error will be handled by the global apiService handler,
      // which shows a toast notification. We re-throw it so that the
      // calling store can handle its loading/error state.
      throw error;
    }
  }
};
