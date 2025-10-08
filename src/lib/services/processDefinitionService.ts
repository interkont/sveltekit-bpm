import { get } from './apiService';
import type { ProcessDefinition, StartFormDefinition } from '$lib/types';

class ProcessDefinitionService {
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
