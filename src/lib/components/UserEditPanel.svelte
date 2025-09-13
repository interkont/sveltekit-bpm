<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { userStore } from '$lib/stores/userStore';
  import type { User } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import { fly, slide } from 'svelte/transition';

  // --- Props & State ---
  export let user: User | {} = {};
  let editableUser: Partial<User>;
  let isNewUser: boolean;

  const dispatch = createEventDispatcher();

  // Lista de todos los roles de proceso disponibles en el sistema
  const allProcessRoles = ["Revisor de Facturas", "Aprobador de Pagos", "Gestor de Contratos", "Analista Financiero", "Supervisor de Cuentas"];
  let roleInput = '';

  onMount(() => {
    isNewUser = !('uid' in user);
    // --- CORRECCIÓN: Usar systemRole para el estado inicial ---
    editableUser = isNewUser 
      ? { displayName: '', email: '', systemRole: 'user', processRoles: [], avatarUrl: 'https://i.pravatar.cc/150?u=new' } 
      : { ...user };
  });

  // --- Logic ---
  function addRole(role: string) {
    if (role && !editableUser.processRoles?.includes(role)) {
      editableUser.processRoles = [...(editableUser.processRoles || []), role];
    }
    roleInput = ''; // Reset input
  }

  function removeRole(roleToRemove: string) {
    editableUser.processRoles = editableUser.processRoles?.filter(r => r !== roleToRemove);
  }

  function handleSave() {
    if (isNewUser) {
      const newUser = { ...editableUser, uid: `user-${Date.now()}` } as User;
      userStore.addUser(newUser);
    } else {
      userStore.updateUser(editableUser as User);
    }
    dispatch('close');
  }

  function handleCancel() {
    dispatch('close');
  }
</script>

<div class="panel-overlay" on:click={handleCancel} transition:fly={{ duration: 300, opacity: 0.5 }}></div>

<aside class="edit-panel" transition:slide={{ duration: 300, axis: 'x' }}>
  {#if editableUser}
    <header class="panel-header">
      <div>
        <h2 class="panel-title">{isNewUser ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</h2>
        <p class="panel-subtitle">{isNewUser ? 'Completa los datos para añadir un nuevo miembro.' : 'Actualiza la información y los roles del usuario.'}</p>
      </div>
      <button class="btn-icon" on:click={handleCancel} title="Cerrar panel">
        <Icon name="x" size={24} />
      </button>
    </header>

    <div class="panel-content">
      <div class="profile-summary">
        <img src={editableUser.avatarUrl} alt="Avatar" class="avatar"/>
      </div>

      <div class="form-group">
        <label for="displayName">Nombre Completo</label>
        <input type="text" id="displayName" class="form-input" bind:value={editableUser.displayName} placeholder="Ej: Ana García"/>
      </div>

      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input type="email" id="email" class="form-input" bind:value={editableUser.email} placeholder="ej: ana.garcia@empresa.com"/>
      </div>

      <div class="form-group">
        <label for="role">Rol del Sistema</label>
        <!-- --- CORRECCIÓN: Enlazar a editableUser.systemRole --- -->
        <select id="role" class="form-input" bind:value={editableUser.systemRole}>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div class="form-group">
        <label for="processRoles">Roles de Proceso</label>
        <div class="tag-input-container">
            <input 
                type="text" 
                list="process-roles-list" 
                class="form-input" 
                bind:value={roleInput} 
                on:change={() => addRole(roleInput)} 
                placeholder="Escribe o selecciona un rol..."/>
            <datalist id="process-roles-list">
                {#each allProcessRoles as role}
                    <option value={role}>{role}</option>
                {/each}
            </datalist>
        </div>
        <div class="assigned-tags">
            {#each editableUser.processRoles || [] as role}
            <div class="tag-item">
                {role}
                <button on:click={() => removeRole(role)} class="remove-tag-btn">
                    <Icon name="x" size={14} />
                </button>
            </div>
            {/each}
        </div>
      </div>
    </div>

    <footer class="panel-footer">
      <button class="btn btn-secondary" on:click={handleCancel}>Cancelar</button>
      <button class="btn btn-primary" on:click={handleSave}>Guardar Cambios</button>
    </footer>
  {/if}
</aside>

<style>
  /* Estilos sin cambios */
  .panel-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 998; }
  .edit-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 480px; z-index: 999; display: flex; flex-direction: column; background-color: var(--bg-secondary); border-left: 1px solid var(--border-color); box-shadow: -5px 0 25px rgba(0,0,0,0.1); }
  .panel-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
  .panel-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
  .panel-subtitle { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem; }
  .panel-content { flex-grow: 1; padding: 2rem 1.5rem; overflow-y: auto; }
  .profile-summary { text-align: center; margin-bottom: 2rem; }
  .avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; border: 3px solid var(--border-color); }
  .form-group { margin-bottom: 1.5rem; }
  .form-group label { display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-primary); }
  .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-primary); border-radius: 8px; font-size: 1rem; }
  select.form-input { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
  .assigned-tags { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.75rem; }
  .tag-item { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 16px; font-size: 0.85rem; font-weight: 500; background-color: var(--accent-color-translucent); color: var(--accent-color); }
  .remove-tag-btn { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--accent-color); opacity: 0.7; padding: 0; transition: opacity 0.2s; }
  .remove-tag-btn:hover { opacity: 1; }
  .panel-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid var(--border-color); background-color: var(--bg-secondary); }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s ease; }
  .btn-primary { color: white; background-color: var(--accent-color); }
  .btn-primary:hover { filter: brightness(1.1); }
  .btn-secondary { color: var(--text-primary); background-color: var(--bg-tertiary); border-color: var(--border-color); }
  .btn-secondary:hover { background-color: var(--border-color); }
  .btn-icon { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: all 0.2s; }
  .btn-icon:hover { background-color: var(--bg-tertiary); color: var(--accent-color); }
</style>
