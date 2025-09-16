<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { User, ProcessRole } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import { userStore } from '$lib/stores/userStore';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { toast } from '$lib/stores/toast';
  import { modal } from '$lib/stores/modal';
  import { v4 as uuidv4 } from 'uuid';

  export let user: User | {} = {};

  const dispatch = createEventDispatcher();

  let isNewUser = !('uid' in user);
  let userData: Partial<User> = { ...user, processRoles: [...(user.processRoles || [])] };

  let title = isNewUser ? 'Añadir Nuevo Usuario' : 'Editar Usuario';
  let saveButtonText = isNewUser ? 'Enviar Invitación' : 'Guardar Cambios';
  
  let isRoleDropdownOpen = false;

  // --- Computed properties ---
  $: assignedRoles = $processRoleStore.filter(role => userData.processRoles?.includes(role.key));
  $: availableRoles = $processRoleStore.filter(role => !userData.processRoles?.includes(role.key));

  // --- Functions ---
  function closePanel() {
    dispatch('close');
  }

  function handleSave() {
    if (!userData.displayName || !userData.email) {
      toast.show('El nombre y el correo son obligatorios.', 'error');
      return;
    }

    if (isNewUser) {
      modal.show({
        title: 'Confirmar Invitación',
        message: `¿Deseas enviar una invitación a ${userData.email} para unirse?`,
        onConfirm: () => {
          const newUser: User = {
            uid: uuidv4(),
            displayName: userData.displayName!,
            email: userData.email!,
            systemRole: userData.systemRole || 'user',
            processRoles: userData.processRoles || [],
            avatarUrl: 'https://i.pravatar.cc/150?u=' + uuidv4(),
            status: 'pending',
          };
          userStore.add(newUser);
          toast.show(`Invitación enviada a ${newUser.email}.`, 'success');
          closePanel();
        },
      });
    } else {
      userStore.update(userData as User);
      toast.show(`Usuario "${userData.displayName}" actualizado.`, 'success');
      closePanel();
    }
  }

  function handleDelete() {
    if (isNewUser) return;
    modal.show({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a ${userData.displayName}?`,
      onConfirm: () => {
        userStore.delete(userData.uid!);
        toast.show(`Usuario "${userData.displayName}" eliminado.`, 'success');
        closePanel();
      },
    });
  }

  function addRole(roleKey: string) {
    if (!userData.processRoles?.includes(roleKey)) {
        userData.processRoles = [...(userData.processRoles || []), roleKey];
    }
    isRoleDropdownOpen = false;
  }

  function removeRole(roleKey: string) {
    userData.processRoles = (userData.processRoles || []).filter(r => r !== roleKey);
  }

  onMount(() => {
    const input = document.querySelector('#userName') as HTMLInputElement;
    if (input) input.focus();
  });
</script>

<div class="panel-overlay" on:click={closePanel}>
  <div class="panel-content" on:click|stopPropagation transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <h2 class="panel-title">{title}</h2>
      <button class="btn-close" on:click={closePanel}>
        <Icon name="x" />
      </button>
    </header>

    <div class="panel-body">
      <form on:submit|preventDefault={handleSave}>
        <div class="form-group">
          <label for="userName" class="form-label">Nombre Completo</label>
          <input type="text" id="userName" class="form-input" bind:value={userData.displayName} required />
        </div>

        <div class="form-group">
          <label for="userEmail" class="form-label">Correo Electrónico</label>
          <input type="email" id="userEmail" class="form-input" bind:value={userData.email} required />
        </div>

        <div class="form-group">
          <label for="systemRole" class="form-label">Rol del Sistema</label>
          <select id="systemRole" class="form-input" bind:value={userData.systemRole}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="form-group">
            <label class="form-label">Roles de Proceso</label>
            <div class="roles-container">
                <div class="role-tags">
                    {#each assignedRoles as role (role.key)}
                        <div class="role-tag">
                            {role.name}
                            <button type="button" class="remove-tag-btn" on:click={() => removeRole(role.key)}>
                                <Icon name="x" size={14} />
                            </button>
                        </div>
                    {/each}
                     {#if assignedRoles.length === 0}
                        <span class="no-roles-text">Sin roles de proceso asignados.</span>
                    {/if}
                </div>

                <div class="add-role-wrapper">
                    <button type="button" class="btn btn-secondary btn-sm" on:click={() => isRoleDropdownOpen = !isRoleDropdownOpen} disabled={availableRoles.length === 0}>
                        <Icon name="plus" class="mr-1" />
                        Añadir Rol
                    </button>
                    {#if isRoleDropdownOpen}
                        <div class="role-dropdown">
                            {#each availableRoles as role (role.key)}
                                <button type="button" class="dropdown-item" on:click={() => addRole(role.key)}>
                                    {role.name}
                                </button>
                            {:else}
                                <div class="dropdown-empty">No hay más roles para añadir</div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
      </form>
    </div>

    <footer class="panel-footer justify-between">
        <div>
            {#if !isNewUser}
                <button type="button" class="btn-subtle-danger" on:click={handleDelete}>
                    <Icon name="trash" class="mr-1" />
                    Eliminar
                </button>
            {/if}
        </div>
        <div class="flex gap-4">
            <button type="button" class="btn btn-secondary" on:click={closePanel}>Cancelar</button>
            <button type="submit" class="btn btn-primary" on:click={handleSave}>{saveButtonText}</button>
        </div>
    </footer>
  </div>
</div>

<style>
  .panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: flex-end; }
  .panel-content { background: var(--bg-primary); width: 100%; max-width: 480px; height: 100%; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
  .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .panel-title { font-size: 1.25rem; font-weight: 600; }
  .btn-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
  .panel-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; }
  .form-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); font-size: 1rem; color: var(--text-primary); transition: all 0.2s; }
  .form-input:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-color-light); }
  .panel-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; background: var(--bg-primary); }
  .justify-between { justify-content: space-between; }
  .flex { display: flex; }
  .gap-4 { gap: 1rem; }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-primary:hover { filter: brightness(1.1); }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background: var(--bg-tertiary); }
  .mr-1 { margin-right: 0.25rem; }

  /* Role Tags Input */
  .roles-container { border: 1px solid var(--border-color); background-color: var(--bg-secondary); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; min-height: 100px; }
  .role-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .role-tag { display: inline-flex; align-items: center; background-color: var(--accent-color-light); color: var(--accent-color); padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.875rem; font-weight: 500; }
  .remove-tag-btn { background: none; border: none; cursor: pointer; margin-left: 0.5rem; padding: 0.25rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--accent-color); }
  .remove-tag-btn:hover { background-color: rgba(0,0,0,0.1); }
  .no-roles-text { color: var(--text-secondary); font-size: 0.9rem; padding: 0.25rem; }
  
  .add-role-wrapper { position: relative; margin-top: auto; }
  .btn-sm { padding: 0.35rem 0.8rem; font-size: 0.85rem; font-weight: 600; }
  
  .role-dropdown { position: absolute; bottom: calc(100% + 5px); left: 0; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-large); z-index: 10; width: 100%; max-height: 200px; overflow-y: auto; }
  .dropdown-item { display: block; width: 100%; text-align: left; padding: 0.75rem 1rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-primary); }
  .dropdown-item:hover { background-color: var(--bg-tertiary); }
  .dropdown-empty { padding: 0.75rem 1rem; color: var(--text-secondary); font-style: italic; }

  /* Subtle Danger Button */
  .btn-subtle-danger { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.6rem 0.5rem; font-weight: 600; font-size: 0.9rem; display: inline-flex; align-items: center; transition: color 0.2s; border-radius: 8px; }
  .btn-subtle-danger:hover { color: #e53e3e; background-color: rgba(229, 62, 62, 0.1); }
</style>
