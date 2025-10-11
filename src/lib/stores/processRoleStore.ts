import { writable } from 'svelte/store';
import type { ProcessRole } from '$lib/types';
import { processRoleService } from '$lib/services/processRoleService';
import { userStore } from './userStore';

interface ProcessRoleStoreState {
  roles: ProcessRole[];
  loading: boolean;
  error: string | null;
}

const createProcessRoleStore = () => {
  const { subscribe, set, update } = writable<ProcessRoleStoreState>({
    roles: [],
    loading: false,
    error: null,

  });

  const fetchRoles = async () => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      let rolesFromApi = await processRoleService.getRoles();
      const roles = rolesFromApi.map(role => ({ ...role, key: role.name }));
      set({ roles, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ roles: [], loading: false, error: message });
    }
  };

  const createRole = async (roleData: { name: string; description: string }) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.createRole(roleData);
      await fetchRoles(); // Refresh the list
    } catch (error) {
      update(state => ({ ...state, loading: false, error: error.message }));
      throw error;
    }
  };

  const updateRole = async (roleId: number, roleData: { name?: string; description?: string; userIds?: number[] }) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.updateRole(roleId, roleData);
      await fetchRoles(); // 1. Refresh roles
      await userStore.fetchUsers(); // 2. Refresh users to update their memberships
    } catch (error) {
      update(state => ({ ...state, loading: false, error: error.message }));
      throw error;
    }
  };

  const deleteRole = async (roleId: number) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.deleteRole(roleId);
      await fetchRoles(); // 1. Refresh roles
      await userStore.fetchUsers(); // 2. Refresh users
    } catch (error) {
      update(state => ({ ...state, loading: false, error: error.message }));
      throw error;
    }
  };

  return {
    subscribe,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};

export const processRoleStore = createProcessRoleStore();
