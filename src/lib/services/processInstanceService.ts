import { get } from './apiService';
import type { ProcessInstance } from '$lib/types';

class ProcessInstanceService {
  /**
   * Fetches the detailed information for a specific process instance.
   * @param instanceId The ID of the process instance to fetch.
   * @returns A promise that resolves to the detailed process instance object.
   */
  async getInstanceDetails(instanceId: number): Promise<ProcessInstance> {
    try {
      // The path is constructed using the instanceId
      const instanceDetails = await get<ProcessInstance>(`/process-instances/${instanceId}`);
      return instanceDetails;
    } catch (error) {
      console.error(`Failed to fetch details for process instance ${instanceId}:`, error);
      // Re-throw the error to be handled by the store or component
      throw error;
    }
  }
}

export const processInstanceService = new ProcessInstanceService();
