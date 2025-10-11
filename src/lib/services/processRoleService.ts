// src/lib/services/processRoleService.ts
import { get, post, put, del } from './apiService';
import type { ProcessRole } from '$lib/types';

class ProcessRoleService {
  /**
   * Fetches the list of all process roles.
   */
  async getRoles(): Promise<ProcessRole[]> {
    try {
      const roles = await get<ProcessRole[]>('/roles');
      return roles;
    } catch (error) {
      console.error('Failed to fetch process roles:', error);
      throw error;
    }
  }

  /**
   * Fetches a single role by its ID, including its members.
   */
  async getRoleById(roleId: number): Promise<ProcessRole> {
    try {
      const role = await get<ProcessRole>(`/roles/${roleId}`);
      return role;
    } catch (error) {
      console.error(`Failed to fetch role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new role.
   */
  async createRole(roleData: { name: string; description: string }): Promise<ProcessRole> {
    try {
      const newRole = await post<ProcessRole>('/roles', roleData);
      return newRole;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Updates an existing role, including its members.
   */
  async updateRole(roleId: number, roleData: { name?: string; description?: string; userIds?: number[] }): Promise<ProcessRole> {
    try {
      const updatedRole = await put<ProcessRole>(`/roles/${roleId}`, roleData);
      return updatedRole;
    } catch (error) {
      console.error(`Failed to update role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a role.
   */
  async deleteRole(roleId: number): Promise<void> {
    try {
      await del(`/roles/${roleId}`);
    } catch (error) {
      console.error(`Failed to delete role ${roleId}:`, error);
      throw error;
    }
  }
}

export const processRoleService = new ProcessRoleService();
