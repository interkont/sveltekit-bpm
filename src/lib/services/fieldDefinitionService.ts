import { get, post, put, del } from './apiService';
import type { FieldDefinition } from '$lib/types';

// Payload type for create/update operations, excluding the id.
export type FieldDefinitionPayload = Omit<FieldDefinition, 'id'>;

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
      // The error is handled by the global apiService handler (toast).
      // Re-throwing allows the calling store to manage its loading/error state.
      throw error;
    }
  },

  /**
   * Fetches a single field definition by its ID.
   * @param id The ID of the field definition to retrieve.
   * @returns A promise that resolves to the FieldDefinition object.
   */
  async getFieldById(id: number): Promise<FieldDefinition> {
    try {
      const field = await get<FieldDefinition>(`/fields/${id}`);
      return field;
    } catch (error) {
      console.error(`Error fetching field definition with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new field definition.
   * @param payload The data for the new field.
   * @returns A promise that resolves to the newly created FieldDefinition object.
   */
  async createField(payload: FieldDefinitionPayload): Promise<FieldDefinition> {
    try {
      const newField = await post<FieldDefinition>('/fields', payload);
      return newField;
    } catch (error) {
      console.error('Error creating field definition:', error);
      throw error;
    }
  },

  /**
   * Updates an existing field definition.
   * @param id The ID of the field to update.
   * @param payload The new data for the field.
   * @returns A promise that resolves to the updated FieldDefinition object.
   */
  async updateField(id: number, payload: FieldDefinitionPayload): Promise<FieldDefinition> {
    try {
      const updatedField = await put<FieldDefinition>(`/fields/${id}`, payload);
      return updatedField;
    } catch (error) {
      console.error(`Error updating field definition with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a field definition by its ID.
   * @param id The ID of the field to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  async deleteField(id: number): Promise<void> {
    try {
      await del(`/fields/${id}`);
    } catch (error) {
      console.error(`Error deleting field definition with id ${id}:`, error);
      throw error;
    }
  }
};
