<script lang="ts">
  import { onMount } from 'svelte';
  import { userStore } from '$lib/stores/userStore';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { modal } from '$lib/stores/modal';
  import { toast } from '$lib/stores/toast';
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

  onMount(() => {
    userStore.fetchUsers();
    processRoleStore.fetchRoles();
  });

  $: filteredUsers = $userStore.users.filter(
    user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derivación reactiva para mapear `role.key` a `role.name`
  $: processRoleNameMap = $processRoleStore.roles.reduce((acc, role) => {
    acc[role.key] = role.name;
    return acc;
  }, {} as { [key: string]: string });

  // --- Manejadores de eventos ---
  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tab;

    if (activeTab === 'Gestión de Roles') {
      // console.log('--- Debug al hacer clic en Tab de Roles ---');
      // console.log('Estado de userStore:', $userStore);
      // console.log('Estado de processRoleStore:', $processRoleStore);
      // console.log(`¿Hay usuarios? ${$userStore.users.length > 0}`, `¿Hay roles? ${$processRoleStore.roles.length > 0}`);
    }
  }

  async function handleSelectUser(user: User | {}) {
    if (!('id' in user) || !user.id) {
      selectedUser = {};
      return;
    }
    try {
      const detailedUser = await userStore.fetchUserById(user.id);
      selectedUser = detailedUser;
    } catch (error) {
      toast.show('No se pudieron cargar los detalles del usuario.', 'error');
    }
  }

  function handleCloseUserPanel() {
    selectedUser = null;
  }
  
  function handleDeleteUser(user: User) {
    modal.show({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a ${user.fullName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await userStore.deleteUser(user.id);
          toast.show('Usuario eliminado con éxito.', 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario';
          toast.show(message, 'error');
        }
      },
    });
  }

  function handleOpenAddMemberPanel(event: CustomEvent) {
    roleForAddingMembers = event.detail.role;
  }

  function handleCloseAddMemberPanel() {
    roleForAddingMembers = null;
  }

  function handleSelectRole(event: CustomEvent) {
    selectedRole = event.detail.role;
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
        <button class="btn btn-primary" on:click={() => handleSelectRole({ detail: { role: {} } })}>
          <Icon name="plus" size={18} class="-ml-1 mr-2" />
          Agregar Rol
        </button>
      {/if}
    </div>
  </header>

  <Tabs items={tabItems} on:tabChange={handleTabChange} />

  <div class="view-content">
    {#if ($userStore.loading && $userStore.users.length === 0) || ($processRoleStore.loading && $processRoleStore.roles.length === 0)}
      <div class="state-placeholder">
        <Icon name="loader" size={24} spinning={true} />
        <span>Cargando datos...</span>
      </div>
    {:else if $userStore.error || $processRoleStore.error}
      <div class="state-placeholder error">
        <Icon name="alert-triangle" size={24} />
        <span>Error al cargar datos: {$userStore.error || $processRoleStore.error}</span>
      </div>
    {:else}
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
                {#each filteredUsers as user (user.id)}
                  <tr class="table-row">
                    <td class="cell-primary">
                      <div class="user-info">
                          <img class="user-avatar" src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} alt="Avatar de {user.fullName}" />
                          <div>
                            <div class="list-name flex items-center">
                              {user.fullName}
                              {#if user.status === 'pending'}
                                <span class="ml-3 px-2 py-px text-xs font-semibold rounded-full uppercase bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pendiente</span>
                              {/if}
                            </div>
                            <div class="text-secondary">{user.email}</div>
                          </div>
                        </div>
                    </td>
                    <td>
                      <span class="px-2 py-px text-xs font-semibold rounded-full uppercase {user.systemRole.toLowerCase() === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300'}">
                        {user.systemRole}
                      </span>
                    </td>
                    <td>
                      <div class="tag-list">
                        {#each user.processRoles as roleName, i}
                          <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{roleName}</span>
                        {/each}
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button class="btn-icon" on:click={() => handleSelectUser(user)} title="Editar usuario">
                          <Icon name="edit" />
                        </button>
                        <button class="btn-icon btn-icon-danger" on:click={() => handleDeleteUser(user)} title="Eliminar usuario">
                          <Icon name="x" />
                        </button>
                      </div>
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
          <RoleManagementContent on:addmember={handleOpenAddMemberPanel} on:editrole={handleSelectRole} />
        </div>
      {/if}
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
    display: flex;
    flex-direction: column;
  }
  
  .state-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    gap: 1rem;
    color: var(--text-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 12px;
  }
  .state-placeholder.error {
    color: #c53030;
    background-color: #f5656520;
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

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }
  .btn-icon:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
  .btn-icon-danger:hover {
    color: #e53e3e; /* text-red-600 */
    background-color: rgba(229, 62, 62, 0.1);
  }
  .gap-2 {
    gap: 0.5rem;
  }
</style>
