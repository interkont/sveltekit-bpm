
<script lang="ts">
  import { userStore } from '$lib/stores/userStore';
  import Icon from '$lib/components/Icon.svelte';
  import Tabs from './layout/Tabs.svelte';
  import UserEditPanel from './UserEditPanel.svelte';
  import type { User } from '$lib/types';
  import { slide } from 'svelte/transition';

  let searchTerm = '';
  let activeTab: string = 'Gestión de Usuarios';
  const tabItems = ['Gestión de Usuarios', 'Gestión de Roles'];

  let selectedUser: User | {} | null = null;

  $: filteredUsers = $userStore.filter(
    user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tab;
  }

  function handleSelectUser(user: User | {}) {
    selectedUser = user;
  }

  function handleClosePanel() {
    selectedUser = null;
  }

  const processRoleNames: { [key: string]: string } = {
    approver: 'Aprobador',
    project_manager: 'Gestor de Proyecto',
    finance_analyst: 'Analista Financiero',
    legal_reviewer: 'Revisor Legal',
    it_support: 'Soporte IT',
  };

</script>

<div class="view-container">
  <header class="view-header">
    <div>
      <h1 class="view-title">Administración de Usuarios</h1>
      <p class="view-subtitle">
        Gestiona los usuarios de la plataforma y sus roles asignados.
      </p>
    </div>
    <div class="actions">
      {#if activeTab === 'Gestión de Usuarios'}
        <button class="btn btn-primary" on:click={() => handleSelectUser({})}>
          <Icon name="plus" size={18} class="-ml-1 mr-2" />
          Añadir Usuario
        </button>
      {/if}
    </div>
  </header>

  <Tabs {tabItems} on:tabChange={handleTabChange} />

  <div class="view-content">
    {#if activeTab === 'Gestión de Usuarios'}
      <div class="user-management-content" transition:slide|local>
        <div class="table-toolbar">
           <div class="search-container">
            <div class="search-icon">
              <Icon name="search" />
            </div>
            <input
              type="text"
              class="search-input"
              placeholder="Buscar por nombre o correo..."
              bind:value={searchTerm}
            />
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead class="table-header">
              <tr>
                <th>Nombre</th>
                <th>Rol de Sistema</th>
                <th>Roles de Proceso</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="table-body">
              {#each filteredUsers as user (user.uid)}
                <tr class="table-row">
                  <td class="cell-primary">
                     <div class="user-info">
                        <img class="user-avatar" src={user.avatarUrl} alt="Avatar de {user.displayName}" />
                        <div>
                          <div class="font-medium">{user.displayName}</div>
                          <div class="text-secondary">{user.email}</div>
                        </div>
                      </div>
                  </td>
                  <td>
                    <span class="role-badge {user.systemRole}">
                      {user.systemRole}
                    </span>
                  </td>
                   <td>
                    <div class="tag-list">
                      {#each user.processRoles as role, i}
                        <span class="tag tag-color-{i % 5}">{processRoleNames[role] || role}</span>
                      {/each}
                    </div>
                  </td>
                  <td class="text-center">
                    <!-- CORRECCIÓN: Botón de texto simple -->
                    <button class="btn-edit" on:click={() => handleSelectUser(user)} title="Editar usuario">
                      Editar
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if activeTab === 'Gestión de Roles'}
      <div class="role-management-content placeholder" transition:slide|local>
         <p>Próximamente: ¡Una nueva forma de gestionar roles y sus miembros!</p>
      </div>
    {/if}
  </div>
</div>

{#if selectedUser}
    <UserEditPanel user={selectedUser} on:close={handleClosePanel} />
{/if}

<style>
  .view-container { padding: 2rem; height: 100%; display: flex; flex-direction: column; background-color: var(--bg-primary); color: var(--text-primary); }
  .view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .view-title { font-size: 1.875rem; font-weight: 700; }
  .view-subtitle { margin-top: 0.5rem; font-size: 1rem; color: var(--text-secondary); }
  .actions .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; color: white; background-color: var(--accent-color); cursor: pointer; transition: all 0.2s ease; }
  .actions .btn-primary:hover { filter: brightness(1.1); }
  .table-toolbar { margin-bottom: 1.5rem; }
  .search-container { position: relative; max-width: 400px; }
  .search-icon { position: absolute; top: 0; bottom: 0; left: 0; padding-left: 0.75rem; display: flex; align-items: center; pointer-events: none; color: var(--text-secondary); }
  .search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); border-radius: 8px; font-size: 1rem; }
  .table-container { overflow: hidden; border: 1px solid var(--border-color); border-radius: 12px; }
  .data-table { min-width: 100%; border-collapse: collapse; }
  .table-header { background-color: var(--bg-secondary); }
  .data-table th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .table-body { background-color: var(--bg-primary); }
  .table-row { border-top: 1px solid var(--border-color); }
  .table-row:hover { background-color: var(--bg-secondary); }
  .data-table td { padding: 1rem 1.5rem; font-size: 0.9rem; vertical-align: middle; }
  .user-info { display: flex; align-items: center; gap: 1rem; }
  .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
  .font-medium { font-weight: 500; color: var(--text-primary); }
  .text-secondary { font-size: 0.875rem; color: var(--text-secondary); }
  .role-badge, .tag { display: inline-flex; padding: 0.3rem 0.8rem; font-size: 0.8rem; font-weight: 500; border-radius: 16px; text-transform: capitalize; }
  .role-badge.admin { background-color: var(--role-admin-bg, #fde2e2); color: var(--role-admin-text, #c53030); }
  .role-badge.user { background-color: var(--role-user-bg, #e2e8f0); color: var(--role-user-text, #4a5568); }
  .tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .tag-color-0 { background-color: #ebf8ff; color: #3182ce; }
  .tag-color-1 { background-color: #f0fff4; color: #38a169; }
  .tag-color-2 { background-color: #fffbeb; color: #d69e2e; }
  .tag-color-3 { background-color: #f7fafc; color: #718096; }
  .tag-color-4 { background-color: #faf5ff; color: #805ad5; }
  
  /* CORRECCIÓN: Nuevo estilo para el botón de texto 'Editar' */
  .btn-edit {
      padding: 0.3rem 0.8rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
  }
  .btn-edit:hover {
      background-color: var(--accent-color-translucent);
      border-color: var(--accent-color);
      color: var(--accent-color);
  }

  .text-right { text-align: right; }
  .placeholder { padding: 2rem; text-align: center; color: var(--text-secondary); border: 2px dashed var(--border-color); border-radius: 12px; }
</style>
