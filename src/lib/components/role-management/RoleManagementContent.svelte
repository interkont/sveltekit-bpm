<script lang="ts">
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { userStore } from '$lib/stores/userStore';
  import Icon from '$lib/components/Icon.svelte';
  import type { ProcessRole, User } from '$lib/types';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let searchTerm = '';

  type RoleWithMembers = {
    role: ProcessRole;
    members: User[];
  };

  // Variable reactiva que primero filtra los roles y luego les añade los miembros
  $: filteredRolesWithMembers = $processRoleStore
    .filter((role) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = role.name.toLowerCase().includes(term);
      // Comprobación de seguridad para la descripción
      const descriptionMatch = role.description ? role.description.toLowerCase().includes(term) : false;
      return nameMatch || descriptionMatch;
    })
    .map((role) => {
      const members = $userStore.filter((user) =>
        user.processRoles.includes(role.key)
      );
      return { role, members };
    });

  // Despachamos el evento para abrir el panel de gestión
  function handleManageMembers(role: ProcessRole) {
    dispatch('addmember', { role });
  }
</script>

<div class="table-view-container" transition:slide|local>
  <div class="table-toolbar">
    <div class="search-container">
      <div class="search-icon">
        <Icon name="search" size={20} />
      </div>
      <input
        type="text"
        class="search-input"
        placeholder="Buscar por nombre o descripción..."
        bind:value={searchTerm}
      />
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead class="table-header">
        <tr>
          <th>Rol</th>
          <th>Cantidad</th>
          <th>Miembros</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody class="table-body">
        {#each filteredRolesWithMembers as { role, members } (role.key)}
          <tr class="table-row">
            <td class="cell-primary">
              <div class="font-medium">{role.name}</div>
              <div class="text-secondary">{role.description || 'Sin descripción'}</div>
            </td>
            <td>
              <div class="member-count">
                <Icon name="users" size={16} />
                <span>{members.length}</span>
              </div>
            </td>
            <td>
              <div class="avatar-stack">
                {#if members.length > 0}
                  {#each members.slice(0, 6) as member (member.uid)}
                    <img
                      class="user-avatar-small" 
                      src={member.avatarUrl}
                      alt={member.displayName}
                      title={member.displayName}
                    />
                  {/each}
                  {#if members.length > 6}
                    <div class="user-avatar-small more">
                      +{members.length - 6}
                    </div>
                  {/if}
                {:else}
                  <span class="text-secondary">--</span>
                {/if}
              </div>
            </td>
            <td class="text-right">
              <button class="btn-edit" on:click={() => handleManageMembers(role)}>
                Gestionar
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  /* 
    Todos los estilos principales (.data-table, .search-input, etc.) 
    se heredan ahora desde el archivo global app.css para asegurar la consistencia. 
  */
  .table-toolbar {
    margin-bottom: 1.5rem;
  }

  .member-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .avatar-stack {
    display: flex;
    align-items: center;
  }

  /* Avatares más pequeños específicos para esta vista de lista */
  .user-avatar-small {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bg-primary);
    margin-left: -12px;
    transition: transform 0.2s ease;
  }

  .user-avatar-small:first-child {
    margin-left: 0;
  }

  .user-avatar-small:hover {
    transform: translateY(-2px);
    z-index: 10;
  }

  .user-avatar-small.more {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

</style>
