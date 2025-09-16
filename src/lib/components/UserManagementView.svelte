<script lang="ts">
  import { userStore } from '$lib/stores/userStore';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import Icon from '$lib/components/Icon.svelte';
  import Tabs from '$lib/components/layout/Tabs.svelte';
  import UserEditPanel from './UserEditPanel.svelte';
  import RoleManagementContent from '$lib/components/role-management/RoleManagementContent.svelte';
  import AddMemberPanel from '$lib/components/role-management/AddMemberPanel.svelte';
  import RoleEditPanel from '$lib/components/role-management/RoleEditPanel.svelte';
  import type { User, ProcessRole } from '$lib/types';
  import { slide } from 'svelte/transition';

  let searchTerm = '';
  let activeTab: string = 'Gestión de Usuarios';
  const tabItems = ['Gestión de Usuarios', 'Gestión de Roles'];

  // Estado para los paneles
  let selectedUser: User | {} | null = null;
  let selectedRole: ProcessRole | {} | null = null;
  let roleForAddingMembers: ProcessRole | null = null;

  $: filteredUsers = $userStore.filter(
    user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derivación reactiva para mapear `role.key` a `role.name`
  $: processRoleNameMap = $processRoleStore.reduce((acc, role) => {
    acc[role.key] = role.name;
    return acc;
  }, {} as { [key: string]: string });

  // --- Manejadores de eventos ---
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tab;
  }

  function handleSelectUser(user: User | {}) {
    selectedUser = user;
  }

  function handleCloseUserPanel() {
    selectedUser = null;
  }

  function handleOpenAddMemberPanel(event: CustomEvent) {
    roleForAddingMembers = event.detail.role;
  }

  function handleCloseAddMemberPanel() {
    roleForAddingMembers = null;
  }

  function handleSelectRole(role: ProcessRole | {}) {
    selectedRole = role;
  }

  function handleCloseRolePanel() {
    selectedRole = null;
  }

  // Tailwind classes for process role tags
  const tagColors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  ];
</script>

<div class="view-container">
  <header class="view-header">
    <div>
      <h1 class="view-title">Administración</h1>
      <p class="view-subtitle">
        Gestiona usuarios, roles y permisos de la plataforma.
      </p>
    </div>
    <div class="actions">
      <!-- Botón para añadir Usuario -->
      {#if activeTab === 'Gestión de Usuarios'}
        <button class="btn btn-primary" on:click={() => handleSelectUser({})}>
          <Icon name="plus" size={18} class="-ml-1 mr-2" />
          Añadir Usuario
        </button>
      {/if}

      <!-- Botón para añadir Rol -->
      {#if activeTab === 'Gestión de Roles'}
        <button class="btn btn-primary" on:click={() => handleSelectRole({})}>
          <Icon name="plus" size={18} class="-ml-1 mr-2" />
          Agregar Rol
        </button>
      {/if}
    </div>
  </header>

  <Tabs items={tabItems} on:tabChange={handleTabChange} />

  <div class="view-content">
    {#if activeTab === 'Gestión de Usuarios'}
      <div class="user-management-content" transition:slide|local>
        <div class="table-toolbar">
           <div class="search-container">
            <div class="search-icon">
              <Icon name="search" size={20}/>
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
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="table-body">
              {#each filteredUsers as user (user.uid)}
                <tr class="table-row">
                  <td class="cell-primary">
                     <div class="user-info">
                        <img class="user-avatar" src={user.avatarUrl} alt="Avatar de {user.displayName}" />
                        <div>
                          <div class="list-name flex items-center">
                            {user.displayName}
                            {#if user.status === 'pending'}
                              <span class="ml-3 px-2 py-px text-xs font-semibold rounded-full uppercase bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pendiente</span>
                            {/if}
                          </div>
                          <div class="text-secondary">{user.email}</div>
                        </div>
                      </div>
                  </td>
                  <td>
                    <span class="px-2 py-px text-xs font-semibold rounded-full uppercase {user.systemRole === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300'}">
                      {user.systemRole}
                    </span>
                  </td>
                   <td>
                    <div class="tag-list">
                      {#each user.processRoles as role, i}
                        <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{processRoleNameMap[role] || role}</span>
                      {/each}
                    </div>
                  </td>
                  <td class="text-center">
                    <button class="btn px-6 py-2 border-2 border-indigo-400 rounded-lg bg-indigo-400/10 hover:shadow-lg text-indigo-600 dark:text-indigo-300" on:click={() => handleSelectUser(user)} title="Editar usuario">
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
      <div transition:slide|local>
        <RoleManagementContent on:addmember={handleOpenAddMemberPanel} />
      </div>
    {/if}
  </div>
</div>

<!-- Renderizado de los paneles -->
{#if selectedUser}
    <UserEditPanel user={selectedUser} on:close={handleCloseUserPanel} />
{/if}

{#if selectedRole}
    <RoleEditPanel role={selectedRole} on:close={handleCloseRolePanel} />
{/if}

{#if roleForAddingMembers}
  <AddMemberPanel role={roleForAddingMembers} on:close={handleCloseAddMemberPanel} />
{/if}

<style scoped>
  .view-container {
    padding: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .view-title {
    font-size: 1.875rem; /* 30px */
    font-weight: 700;
  }

  .view-subtitle {
    margin-top: 0.5rem;
    font-size: 1rem; /* 16px */
    color: var(--text-secondary);
  }

  .actions .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
    border: none;
    color: white;
    background-color: var(--accent-color);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .actions .btn-primary:hover {
    filter: brightness(1.1);
  }

  .view-content {
    flex-grow: 1;
  }

  .user-management-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .table-toolbar {
    margin-bottom: 1rem;
  }

   .search-container {
    position: relative;
    width: 100%;
    max-width: 300px;
  }

  .table-container {
    overflow-x: auto;
    flex-grow: 1;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .table-header th {
    padding: 0.75rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .table-body tr {
    border-bottom: 1px solid var(--border-color);
  }

  .table-body tr:last-child {
    border-bottom: none;
  }

  .table-row td {
    padding: 1rem 0.75rem;
  }

  .cell-primary {
    font-weight: 500;
    color: var(--text-primary);
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    margin-right: 0.75rem;
  }

  .text-secondary {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .btn-edit {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-edit:hover {
    background-color: var(--bg-hover-color);
  }

  .text-center {
    text-align: center !important;
  }
</style>
