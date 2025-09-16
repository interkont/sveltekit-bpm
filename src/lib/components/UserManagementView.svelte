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
                          <div class="font-medium flex items-center">
                            {user.displayName}
                            {#if user.status === 'pending'}
                              <span class="status-badge pending-badge">Pendiente</span>
                            {/if}
                          </div>
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
                        <span class="tag tag-color-{i % 5}">{processRoleNameMap[role] || role}</span>
                      {/each}
                    </div>
                  </td>
                  <td class="text-right">
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

<style>
  .view-container { padding: 2rem; height: 100%; display: flex; flex-direction: column; }
  .view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .view-title { font-size: 1.875rem; font-weight: 700; }
  .view-subtitle { margin-top: 0.5rem; font-size: 1rem; color: var(--text-secondary); }
  .actions .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; color: white; background-color: var(--accent-color); cursor: pointer; transition: all 0.2s ease; }
  .actions .btn-primary:hover { filter: brightness(1.1); }

  .status-badge {
    margin-left: 0.75rem;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: uppercase;
  }

  .pending-badge {
    background-color: #fef3c7; /* yellow-100 */
    color: #92400e; /* yellow-800 */
  }

  :global(.dark) .pending-badge {
    background-color: #78350f; /* yellow-900 */
    color: #fef3c7; /* yellow-100 */
  }
</style>
