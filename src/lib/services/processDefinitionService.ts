import { get, post, put, patch, del } from './apiService';
import type { ProcessDefinition, StartFormDefinition, ProcessDefinitionPayload, ProcessDefinitionData, SaveActionResponse } from '$lib/types';

class ProcessDefinitionService {
  /**
   * Fetches all process definitions for administrative purposes.
   * @returns A promise that resolves to an array of all process definitions.
   */
  async getAllProcesses(): Promise<ProcessDefinition[]> {
    try {
      const definitions = await get<ProcessDefinition[]>('/processes/all');
      return definitions;
    } catch (error) {
      console.error('Failed to fetch all process definitions:', error);
      throw error;
    }
  }

  /**
   * Fetches the list of available process definitions that can be started.
   * @returns A promise that resolves to an array of process definitions.
   */
  async getAvailableProcesses(): Promise<ProcessDefinition[]> {
    try {
      const definitions = await get<ProcessDefinition[]>('/processes');
      return definitions;
    } catch (error) {
      console.error('Failed to fetch process definitions:', error);
      throw error;
    }
  }

  /**
   * Fetches the detailed definition of a single process by its ID.
   * @param definitionId The ID of the process definition.
   * @returns A promise that resolves to the detailed process definition.
   */
  async getProcessById(definitionId: number): Promise<ProcessDefinition> {
    try {
      const definition = await get<ProcessDefinition>(`/processes/${definitionId}`);
      return definition;
    } catch (error) {
      console.error(`Failed to fetch process definition for id ${definitionId}:`, error);
      throw error;
    }
  }

  /**
   * Checks the expected action before saving a process definition.
   * @param definitionId The ID of the process definition.
   * @returns A promise that resolves to the save action details.
   */
  async getSaveAction(definitionId: number): Promise<SaveActionResponse> {
    try {
      const response = await get<SaveActionResponse>(`/processes/${definitionId}/save-ask`);
      return response;
    } catch (error) {
      console.error(`Failed to get save action for process ${definitionId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new process definition.
   * @param payload The data for the new process definition.
   * @returns A promise that resolves to the newly created process definition.
   */
  async createProcess(payload: ProcessDefinitionPayload): Promise<ProcessDefinition> {
    try {
      const newDefinition = await post<ProcessDefinition>('/processes', payload);
      return newDefinition;
    } catch (error) {
      console.error('Failed to create process definition:', error);
      throw error;
    }
  }

  /**
   * Updates an existing process definition (full update).
   * @param definitionId The ID of the process definition to update.
   * @param payload The updated data for the process definition.
   * @returns A promise that resolves to the updated process definition.
   */
  async updateProcess(definitionId: number, payload: ProcessDefinitionPayload): Promise<ProcessDefinition> {
    try {
      const updatedDefinition = await put<ProcessDefinition>(`/processes/${definitionId}`, payload);
      return updatedDefinition;
    } catch (error) {
      console.error(`Failed to update process definition ${definitionId}:`, error);
      throw error;
    }
  }

  /**
   * Partially updates the metadata of a process definition.
   * @param definitionId The ID of the process definition to update.
   * @param payload The metadata fields to update.
   * @returns A promise that resolves to the updated process definition.
   */
  async patchProcessMetadata(definitionId: number, payload: Partial<ProcessDefinitionData>): Promise<ProcessDefinition> {
    try {
      const updatedDefinition = await patch<ProcessDefinition>(`/processes/${definitionId}`, payload);
      return updatedDefinition;
    } catch (error) {
      console.error(`Failed to patch process metadata for ${definitionId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a process definition.
   * @param definitionId The ID of the process definition to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  async deleteProcess(definitionId: number): Promise<void> {
    try {
      await del(`/processes/${definitionId}`);
    } catch (error) {
      console.error(`Failed to delete process definition ${definitionId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the form definition required to start a specific process.
   * @param definitionId The ID of the process definition.
   * @returns A promise that resolves to the start form definition object.
   */
  async getStartForm(definitionId: number): Promise<StartFormDefinition> {
    try {
      const formDefinition = await get<StartFormDefinition>(`/processes/${definitionId}/start-form`);
      return formDefinition;
    } catch (error) {
      console.error(`Failed to fetch start form for process ${definitionId}:`, error);
      throw error;
    }
  }
}

export const processDefinitionService = new ProcessDefinitionService();
