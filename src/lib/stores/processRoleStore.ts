import { writable } from 'svelte/store';
import type { ProcessRole } from '$lib/types';
import { processRoles as initialRoles } from '$lib/data/process-roles';

const createProcessRoleStore = () => {
  const { subscribe, set, update } = writable<ProcessRole[]>(initialRoles);

  return {
    subscribe,
    
    /**
     * Agrega un nuevo rol al store.
     * @param role El nuevo rol a agregar.
     */
    add: (role: ProcessRole) => {
      update(roles => [...roles, role]);
    },

    /**
     * Actualiza un rol existente en el store.
     * @param updatedRole El rol con la información actualizada.
     */
    update: (updatedRole: ProcessRole) => {
      update(roles => roles.map(role => 
        role.key === updatedRole.key ? updatedRole : role
      ));
    },

    /**
     * Elimina un rol del store por su clave.
     * @param key La clave del rol a eliminar.
     */
    delete: (key: string) => {
      update(roles => roles.filter(role => role.key !== key));
    },

    /**
     * Reemplaza todos los roles con un nuevo conjunto de datos.
     * @param newRoles El nuevo array de roles.
     */
    set: (newRoles: ProcessRole[]) => {
      set(newRoles);
    }
  };
};

export const processRoleStore = createProcessRoleStore();
