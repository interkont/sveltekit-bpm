<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { sidebarStore } from '$lib/stores/sidebarStore';
  import { page } from '$app/stores';
  import { modal } from '$lib/stores/modal';
  import { authService } from '$lib/services/authService';
  import { _ } from 'svelte-i18n';
  import { authStore } from '$lib/stores/authStore';

  $: activeItem = $page.url.hash.substring(1) || 'dashboard';
  $: userModules = $authStore.user?.modules || [];

  const moduleMap = {
    dashboard: 'DASH',
    tasks: 'TASK',
    processes: 'INST',
    'process-models': 'PROC',
    users: 'ORG'
  };

  function hasAccess(moduleKey: keyof typeof moduleMap): boolean {
    if (!$authStore.user) return false;
    const requiredModule = moduleMap[moduleKey];
    return userModules.includes(requiredModule);
  }

  function navigate(view: string) {
    window.location.hash = view;
  }

  function handleLogout() {
    modal.show({
      title: $_('sidebar.logout_confirm_title'),
      message: $_('sidebar.logout_confirm_message'),
      onConfirm: () => {
        authService.logout();
      }
    });
  }
</script>

<aside class:collapsed={$sidebarStore}>
  <div class="logo">
    <Icon name="zap" size={32} />
    <span class="logo-text">Flowify</span>
  </div>
  <nav>
    {#if hasAccess('dashboard')}
      <button class:active={activeItem === 'dashboard'} on:click={() => navigate('dashboard')}>
        <Icon name="layout-dashboard" size={24}/>
        <span class="nav-text">{$_('sidebar.dashboard')}</span>
      </button>
    {/if}
    {#if hasAccess('tasks')}
      <button class:active={activeItem === 'tasks'} on:click={() => navigate('tasks')}>
        <Icon name="check-square" size={24}/>
        <span class="nav-text">{$_('sidebar.tasks')}</span>
      </button>
    {/if}
    {#if hasAccess('processes')}
      <button class:active={activeItem === 'processes'} on:click={() => navigate('processes')}>
        <Icon name="git-branch" size={24}/>
        <span class="nav-text">{$_('sidebar.cases')}</span>
      </button>
    {/if}
    {#if hasAccess('process-models')}
      <button class:active={activeItem === 'process-models'} on:click={() => navigate('process-models')}>
        <Icon name="network" size={24}/>
        <span class="nav-text">{$_('sidebar.processes')}</span>
      </button>
    {/if}
    {#if hasAccess('users')}
      <button class:active={activeItem === 'users'} on:click={() => navigate('users')}>
        <Icon name="users" size={24}/>
        <span class="nav-text">{$_('sidebar.teams')}</span>
      </button>
    {/if}
  </nav>

  <div class="sidebar-footer">
    <button class="logout-btn" on:click={handleLogout}>
        <Icon name="log-out" size={24}/>
        <span class="nav-text">{$_('sidebar.logout_button')}</span>
    </button>
  </div>

  <button
    class="collapse-btn"
    on:click={sidebarStore.toggle}
    title={$sidebarStore ? $_('sidebar.expand_menu') : $_('sidebar.collapse_menu')}
  >
      <Icon name={$sidebarStore ? 'chevron-right-circle' : 'chevron-left-circle'} size={24}/>
    </button>
</aside>

<style>
  aside {
    width: 255px;
    background-color: var(--bg-sidebar);
    color: var(--text-sidebar);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.3s ease;
    position: relative;
  }

  aside.collapsed {
    width: 88px;
  }

  aside.collapsed .logo,
  aside.collapsed nav,
  aside.collapsed .sidebar-footer {
    align-items: center;
  }
  aside.collapsed .logo-text,
  aside.collapsed .nav-text {
    display: none;
  }
  aside.collapsed .logo {
      justify-content: center;
  }
  aside.collapsed nav {
      gap: 0.75rem;
      margin-top: 12px;
  }
  aside.collapsed button {
    justify-content: center;
    padding: 0.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin-bottom: 2.5rem;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
  }

  nav button, .logout-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: none;
    border: none;
    color: var(--text-sidebar);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s, color 0.2s;
  }
  nav button:hover, .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  nav button.active {
    background-color: var(--accent-color);
    color: var(--text-sidebar-active);
  }

  .sidebar-footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .collapse-btn {
    position: absolute;
    top: 2.8rem;
    right: -14px;
    background-color: var(--bg-sidebar);
    color: var(--text-sidebar);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 100;
    transition: right 0.3s ease, transform 0.3s ease, background-color 0.2s, color 0.2s;
    transform: translateY(-50%);
    padding:0px !important;
  }
</style>
