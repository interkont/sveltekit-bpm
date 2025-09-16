<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { sidebarStore } from '$lib/stores/sidebarStore';
  import { page } from '$app/stores';
  // --- AJUSTE: Corregir el nombre del store importado ---
  import { modal } from '$lib/stores/modal';
  import { authStore } from '$lib/stores/authStore';

  $: activeItem = $page.url.hash.substring(1) || 'dashboard';

  function navigate(view: string) {
    window.location.hash = view;
  }

  // --- AJUSTE: Usar el nombre correcto del store (`modal`) ---
  function handleLogout() {
    modal.show({
      title: 'Confirmar Cierre de Sesión',
      message: '¿Estás seguro de que deseas cerrar tu sesión en Flowify?',
      onConfirm: () => {
        authStore.logout();
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
    <button class:active={activeItem === 'dashboard'} on:click={() => navigate('dashboard')}>
      <Icon name="layout-dashboard" size={24}/>
      <span class="nav-text">Dashboard</span>
    </button>
    <button class:active={activeItem === 'tasks'} on:click={() => navigate('tasks')}>
      <Icon name="check-square" size={24}/>
      <span class="nav-text">Mis Tareas</span>
    </button>
    <button class:active={activeItem === 'processes'} on:click={() => navigate('processes')}>
      <Icon name="git-branch" size={24}/>
      <span class="nav-text">Instancias</span>
    </button>
    <button class:active={activeItem === 'process-models'} on:click={() => navigate('process-models')}>
      <Icon name="network" size={24}/>
      <span class="nav-text">Modelado</span>
    </button>
    <button class:active={activeItem === 'users'} on:click={() => navigate('users')}>
      <Icon name="users" size={24}/>
      <span class="nav-text">Usuarios</span>
    </button>
		<!--
    <button class:active={activeItem === 'test-modeler'} on:click={() => navigate('test-modeler')}>
      <Icon name="network" size={24}/>
      <span class="nav-text">Test Modeler</span>
    </button>
    -->
  </nav>

  <div class="sidebar-footer">
    <button class="logout-btn" on:click={handleLogout}>
        <Icon name="log-out" size={24}/>
        <span class="nav-text">Cerrar Sesión</span>
    </button>
  </div>

  <!-- Botón de colapsar/expandir - REPOSICIONADO -->
  <button
    class="collapse-btn"
    on:click={sidebarStore.toggle}
    title={$sidebarStore ? 'Expandir menú' : 'Colapsar menú'}
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
    position: relative; /* Añadido para posicionamiento absoluto del botón */
  }

  aside.collapsed {
    width: 88px; /* Ajustado para el padding */
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
    padding: 0.5rem; /* Padding uniforme para modo colapsado */
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
    margin-top: auto; /* Empuja el footer hacia abajo */
    display: flex;
    flex-direction: column;
    gap: 0.5rem; /* Espacio entre los botones del footer */
  }
  .collapse-btn {
    position: absolute;
    top: 2.8rem; /* Ajusta según el padding superior del aside */
    right: -14px; /* Ajusta para que quede sobrepuesto */
    background-color: var(--bg-sidebar); /* Fondo circular */
    color: var(--text-sidebar); /* Color del icono */
    border-radius: 50%; /* Forma circular */
    width: 32px; /* Tamaño del círculo */
    height: 32px; /* Tamaño del círculo */
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* Sombra */
    z-index: 100; /* Asegura que esté encima */
    transition: right 0.3s ease, transform 0.3s ease, background-color 0.2s, color 0.2s;
    transform: translateY(-50%); /* Centra verticalmente */
    padding:0px !important;
  }
</style>
