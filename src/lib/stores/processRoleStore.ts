import { writable, get } from 'svelte/store';
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

  // --- INTELLIGENT LOADING ---
  let hasBeenLoaded = false;

  const fetchRoles = async (force = false) => {
    // If we've already loaded and aren't forcing a refresh, do nothing.
    if (hasBeenLoaded && !force) {
      return;
    }

    update(state => ({ ...state, loading: true, error: null }));
    try {
      let rolesFromApi = await processRoleService.getRoles();
      const roles = rolesFromApi.map(role => ({ ...role, key: role.name }));
      set({ roles, loading: false, error: null });
      hasBeenLoaded = true; // Mark as loaded
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ roles: [], loading: false, error: message });
      hasBeenLoaded = false; // Allow retrying if it failed
    }
  };

  const createRole = async (roleData: { name: string; description: string }) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.createRole(roleData);
      await fetchRoles(true); // Force refresh
    } catch (error) {
      update(state => ({ ...state, loading: false, error: error.message }));
      throw error;
    }
  };

  const updateRole = async (roleId: number, roleData: { name?: string; description?: string; userIds?: number[] }) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.updateRole(roleId, roleData);
      await fetchRoles(true); // Force refresh
      await userStore.fetchUsers();
    } catch (error) {
      update(state => ({ ...state, loading: false, error: error.message }));
      throw error;
    }
  };

  const deleteRole = async (roleId: number) => {
    update(state => ({ ...state, loading: true }));
    try {
      await processRoleService.deleteRole(roleId);
      await fetchRoles(true); // Force refresh
      await userStore.fetchUsers();
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
