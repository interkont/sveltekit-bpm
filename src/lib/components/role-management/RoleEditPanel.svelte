<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { ProcessRole, User } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import { processRoleService } from '$lib/services/processRoleService';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { userStore } from '$lib/stores/userStore';
  import { toast } from '$lib/stores/toast';

  export let role: ProcessRole | {} = {};

  const dispatch = createEventDispatcher();

  let isNewRole: boolean;
  let roleData: Partial<ProcessRole> = {};
  let title: string;
  let saveButtonText: string;
  let memberSearchTerm = '';
  let selectedMemberIds = new Set<number>();

  $: {
    title = 'id' in role && role.id ? 'Editar Rol' : 'Agregar Nuevo Rol';
    saveButtonText = 'id' in role && role.id ? 'Guardar Cambios' : 'Crear Rol';
    isNewRole = !('id' in role && role.id);
    
    if ('id' in role && role.id) {
      processRoleService.getRoleById(role.id).then(detailedRole => {
        roleData = { ...detailedRole };
        selectedMemberIds = new Set(
          detailedRole.users?.map(u => u.id).filter((id): id is number => id != null) || []
        );
      });
    } else {
      roleData = { name: '', description: '' };
      selectedMemberIds = new Set();
    }
  }

  $: filteredUsers = $userStore.users.filter(u => 
    u.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  function closePanel() {
    dispatch('close');
  }

  function toggleMember(userId: number) {
    if (selectedMemberIds.has(userId)) {
      selectedMemberIds.delete(userId);
    } else {
      selectedMemberIds.add(userId);
    }
    selectedMemberIds = selectedMemberIds; // Trigger reactivity
  }

  async function handleSave() {
    if (!roleData.name) {
      toast.show('El nombre del rol es obligatorio.', 'error');
      return;
    }

    try {
      if (isNewRole) {
        await processRoleStore.createRole({
          name: roleData.name,
          description: roleData.description || '',
        });
        toast.show(`Rol "${roleData.name}" creado.`, 'success');
      } else {
        await processRoleStore.updateRole(roleData.id!, {
          name: roleData.name,
          description: roleData.description,
          userIds: Array.from(selectedMemberIds),
        });
        toast.show(`Rol "${roleData.name}" actualizado.`, 'success');
      }
      closePanel();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      toast.show(message, 'error');
    }
  }

  onMount(() => {
    const input = document.querySelector('#roleName') as HTMLInputElement;
    if (input) input.focus();
  });
</script>

<div class="panel-overlay" on:click={closePanel}>
  <div class="panel-content" on:click|stopPropagation transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <h2 class="panel-title">{title}</h2>
      <button class="btn-close" on:click={closePanel}> <Icon name="x" /> </button>
    </header>

    <div class="panel-body">
      <form on:submit|preventDefault={handleSave}>
        <div class="form-group">
          <label for="roleName" class="form-label">Nombre del Rol</label>
          <input type="text" id="roleName" class="form-input" bind:value={roleData.name} required />
        </div>
        <div class="form-group">
          <label for="roleDescription" class="form-label">Descripción</label>
          <textarea id="roleDescription" class="form-textarea" rows="3" bind:value={roleData.description}></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Miembros</label>
          <div class="member-management">
            <div class="search-container-local">
              <input type="text" class="form-input" placeholder="Buscar usuarios..." bind:value={memberSearchTerm} />
              <Icon name="search" size={18} class="search-icon-local" />
            </div>

            <div class="user-list-single">
              {#each filteredUsers as user (user.id)}
                <div class="user-list-item">
                  <div class="user-info">
                    <img class="user-avatar" src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} alt={user.fullName} />
                    <div>
                      <div class="font-medium">{user.fullName}</div>
                      <div class="text-sm text-secondary">{user.email}</div>
                    </div>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" checked={selectedMemberIds.has(user.id)} on:change={() => toggleMember(user.id)} />
                    <span class="slider"></span>
                  </label>
                </div>
              {:else}
                <div class="empty-list-placeholder">No se encontraron usuarios.</div>
              {/each}
            </div>
          </div>
        </div>
      </form>
    </div>

    <footer class="panel-footer">
      <button type="button" class="btn btn-secondary" on:click={closePanel}>Cancelar</button>
      <button type="submit" class="btn btn-primary" on:click={handleSave}>{saveButtonText}</button>
    </footer>
  </div>
</div>

<style>
  /* Base panel styles */
  .panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: flex-end; }
  .panel-content { background: var(--bg-primary); width: 100%; max-width: 480px; height: 100%; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
  .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .panel-title { font-size: 1.25rem; font-weight: 600; }
  .btn-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
  .panel-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; }
  .form-input, .form-textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); font-size: 1rem; color: var(--text-primary); transition: all 0.2s; }
  .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-color-light); }
  .panel-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; background: var(--bg-primary); }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  
  /* Member Management Styles */
  .member-management { border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
  .search-container-local { position: relative; margin-bottom: 1rem; }
  :global(.search-icon-local) { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
  .search-container-local .form-input { padding-left: 2.5rem; }
  .user-list-single { border: 1px solid var(--border-color); border-radius: 8px; max-height: 400px; overflow-y: auto; background-color: var(--bg-secondary); }
  .user-list-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border-color); }
  .user-list-item:last-child { border-bottom: none; }
  .user-info { display: flex; align-items: center; gap: 0.75rem; }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; }
  .font-medium { font-weight: 500; }
  .text-sm { font-size: 0.875rem; }
  .text-secondary { color: var(--text-secondary); }
  .empty-list-placeholder { text-align: center; padding: 2rem; font-size: 0.9rem; color: var(--text-secondary); }

  /* Toggle Switch Styles */
  .toggle-switch { position: relative; display: inline-block; width: 40px; height: 24px; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-tertiary); transition: .4s; border-radius: 24px; }
  .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
  input:checked + .slider { background-color: var(--accent-color); }
  input:checked + .slider:before { transform: translateX(16px); }
</style>
