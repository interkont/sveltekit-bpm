<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { ProcessRole } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import { userStore } from '$lib/stores/userStore';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { toast } from '$lib/stores/toast';

  export let role: ProcessRole;

  const dispatch = createEventDispatcher();

  let roleDescription = role.description || '';
  let searchTerm = '';
  let assignedMembers = $userStore.filter(u => u.processRoles.includes(role.key)).map(u => u.uid);

  $: filteredUsers = $userStore.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function closePanel() {
    dispatch('close');
  }

  function handleSaveChanges() {
    // 1. Actualizar la descripción del rol
    if (roleDescription !== role.description) {
      const updatedRole = { ...role, description: roleDescription };
      processRoleStore.update(updatedRole);
    }

    // 2. Actualizar los miembros asignados
    userStore.updateRoleAssignments(role.key, assignedMembers);

    toast.show(`Miembros del rol "${role.name}" actualizados.`, 'success');
    closePanel();
  }

  function toggleMember(userId: string) {
    if (assignedMembers.includes(userId)) {
      assignedMembers = assignedMembers.filter(uid => uid !== userId);
    } else {
      assignedMembers = [...assignedMembers, userId];
    }
  }

  onMount(() => {
    const input = document.querySelector('#userSearch') as HTMLInputElement;
    if (input) input.focus();
  });

</script>

<div class="panel-overlay" on:click={closePanel}>
  <div class="panel-content" on:click|stopPropagation transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <div>
        <h2 class="panel-title">Gestionar Miembros: {role.name}</h2>
        <p class="panel-subtitle">Asigna o remueve usuarios para este rol.</p>
      </div>
      <button class="btn-close" on:click={closePanel}>
        <Icon name="x" />
      </button>
    </header>

    <div class="panel-body">
      <!-- Campo para editar la descripción del rol -->
      <div class="form-group">
        <label for="roleDescription" class="form-label">Descripción del Rol</label>
        <textarea
          id="roleDescription"
          class="form-textarea"
          rows="3"
          bind:value={roleDescription}
          placeholder="Añade una descripción para este rol..."
        ></textarea>
      </div>

      <!-- Buscador de usuarios -->
      <div class="form-group">
        <label for="userSearch" class="form-label">Buscar Usuarios</label>
        <div class="search-container-local">
            <input
                type="text"
                id="userSearch"
                class="form-input"
                placeholder="Filtrar por nombre o correo..."
                bind:value={searchTerm}
            />
            <div class="search-icon-local">
                <Icon name="search" size={18} />
            </div>
        </div>
      </div>

      <!-- Lista de usuarios para asignar -->
      <div class="user-list">
        {#each filteredUsers as user (user.uid)}
          <label class="user-list-item">
            <div class="user-info">
                <img src={user.avatarUrl} alt={user.displayName} class="user-avatar-small" />
                <div>
                    <div class="font-medium">{user.displayName}</div>
                    <div class="text-secondary">{user.email}</div>
                </div>
            </div>
            <input 
              type="checkbox" 
              class="checkbox-toggle"
              checked={assignedMembers.includes(user.uid)}
              on:change={() => toggleMember(user.uid)}
            />
          </label>
        {/each}
      </div>
    </div>

    <footer class="panel-footer">
      <button class="btn btn-secondary" on:click={closePanel}>Cancelar</button>
      <button class="btn btn-primary" on:click={handleSaveChanges}>Guardar Cambios</button>
    </footer>
  </div>
</div>

<style>
  .panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: flex-end; }
  .panel-content { background: var(--bg-primary); width: 100%; max-width: 520px; height: 100%; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
  .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start; }
  .panel-title { font-size: 1.25rem; font-weight: 600; }
  .panel-subtitle { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem; }
  .btn-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
  .panel-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; }
  .form-input, .form-textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); font-size: 1rem; color: var(--text-primary); transition: all 0.2s; }
  .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-color-light); }
  
  .search-container-local { position: relative; }
  .search-icon-local { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); color: var(--text-secondary); }
  .form-input { padding-right: 2.5rem; }

  .user-list { border: 1px solid var(--border-color); border-radius: 8px; max-height: 400px; overflow-y: auto; }
  .user-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background-color 0.2s; }
  .user-list-item:last-child { border-bottom: none; }
  .user-list-item:hover { background-color: var(--bg-secondary); }
  .user-info { display: flex; align-items: center; gap: 1rem; }
  .user-avatar-small { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
  
  .checkbox-toggle { appearance: none; width: 48px; height: 28px; background-color: var(--bg-tertiary); border-radius: 9999px; position: relative; cursor: pointer; transition: background-color 0.2s; }
  .checkbox-toggle::before { content: ''; position: absolute; width: 22px; height: 22px; border-radius: 50%; background: white; top: 3px; left: 4px; transition: transform 0.2s; }
  .checkbox-toggle:checked { background-color: var(--accent-color); }
  .checkbox-toggle:checked::before { transform: translateX(19px); }

  .panel-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; background: var(--bg-primary); }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-primary:hover { filter: brightness(1.1); }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background: var(--bg-tertiary); }
</style>
