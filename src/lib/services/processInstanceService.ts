import { get, post } from './apiService'; // Import 'post'
import type { ProcessInstance } from '$lib/types';

// Interface for the payload to create a new process instance
interface CreateInstancePayload {
  businessProcessKey: string;
  description: string;
  businessData: Record<string, any>;
}

// Interface for the response after creating an instance
interface CreateInstanceResponse {
  processInstanceId: number;
  status: string;
  message: string;
}

class ProcessInstanceService {
  /**
   * Creates a new instance of a process.
   * @param payload The data required to start the process.
   * @returns A promise that resolves to the response from the server.
   */
  async createInstance(payload: CreateInstancePayload): Promise<CreateInstanceResponse> {
    try {
      const response = await post<CreateInstanceResponse>('/process-instances', payload);
      return response;
    } catch (error) {
      console.error('Failed to create process instance:', error);
      throw error;
    }
  }

  async getAllInstances(): Promise<ProcessInstance[]> {
    try {
      const instances = await get<ProcessInstance[]>('/process-instances');
      return instances;
    } catch (error) {
      console.error('Failed to fetch process instances:', error);
      throw error;
    }
  }

  async getInstanceDetails(instanceId: number): Promise<ProcessInstance> {
    try {
      const instanceDetails = await get<ProcessInstance>(`/process-instances/${instanceId}`);
      return instanceDetails;
    } catch (error) {
      console.error(`Failed to fetch details for process instance ${instanceId}:`, error);
      throw error;
    }
  }
}

export const processInstanceService = new ProcessInstanceService();
