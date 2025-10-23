<script lang="ts">
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { userStore } from '$lib/stores/userStore';
  import Icon from '$lib/components/Icon.svelte';
  import type { ProcessRole } from '$lib/types';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { modal } from '$lib/stores/modal';
  import { toast } from '$lib/stores/toast';
  import { _ } from 'svelte-i18n';

  const dispatch = createEventDispatcher();

  let searchTerm = '';

  $: filteredRoles = $processRoleStore.roles.filter((role) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = role.name.toLowerCase().includes(term);
      const descriptionMatch = role.description ? role.description.toLowerCase().includes(term) : false;
      return nameMatch || descriptionMatch;
    });

  // Corrected reactive block
  $: rolesWithFullMembers = filteredRoles.map(role => {
      // For each role, we search the ENTIRE user list to find its members.
      const members = $userStore.users.filter(user => 
          // A user belongs to a role if the user's 'roles' array contains this role's id.
          user.roles?.some(userRole => userRole.id === role.id)
      );
      // We return the original role object, but with the 'users' property injected.
      return { ...role, users: members };
  });

  function handleEditRole(role: ProcessRole) {
    dispatch('editrole', { role });
  }

  function handleDeleteRole(role: ProcessRole) {
    modal.show({
      title: $_('user_management.delete_role_confirm_title'),
      message: $_('user_management.delete_role_confirm_message', { values: { name: role.name } }),
      onConfirm: async () => {
        try {
          await processRoleStore.deleteRole(role.id);
          toast.show($_('user_management.delete_role_success'), 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : $_('user_management.unexpected_error');
          toast.show(message, 'error');
        }
      },
    });
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
        placeholder={$_('user_management.role_search_placeholder')}
        bind:value={searchTerm}
      />
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead class="table-header">
        <tr>
          <th>{$_('user_management.role_header')}</th>
          <th>{$_('user_management.quantity_header')}</th>
          <th>{$_('user_management.members_header')}</th>
          <th class="text-center">{$_('user_management.actions_header')}</th>
        </tr>
      </thead>
      <tbody class="table-body">
        {#each rolesWithFullMembers as role (role.id)}
          <tr class="table-row">
            <td class="cell-primary">
              <div class="list-name">{role.name}</div>
              <div class="text-secondary">{role.description || $_('user_management.no_description')}</div>
            </td>
            <td>
              <div class="member-count">
                <Icon name="users" size={16} />
                <span>{role.users?.length || 0}</span>
              </div>
            </td>
            <td>
              <div class="avatar-stack">
                {#if role.users && role.users.length > 0}
                  {#each role.users.slice(0, 6) as member (member.id)}
                    <img
                      class="user-avatar-small" 
                      src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random`}
                      alt={member.fullName}
                      title={member.fullName}
                    />
                  {/each}
                  {#if role.users.length > 6}
                    <div class="user-avatar-small more">
                      +{role.users.length - 6}
                    </div>
                  {/if}
                {:else}
                  <span class="text-secondary">--</span>
                {/if}
              </div>
            </td>
            <td class="text-center">
               <div class="flex items-center justify-center gap-2">
                <button class="btn-icon" on:click={() => handleEditRole(role)} title={$_('user_management.edit_role_tooltip')}>
                  <Icon name="edit" />
                </button>
                <button class="btn-icon btn-icon-danger" on:click={() => handleDeleteRole(role)} title={$_('user_management.delete_role_tooltip')}>
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

<style>
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
</style>
