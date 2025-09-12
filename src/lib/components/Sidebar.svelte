<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { sidebarStore } from '$lib/stores/sidebarStore';
  // --- AJUSTE: Importamos el store '$page' de SvelteKit ---
  import { page } from '$app/stores';

  // --- AJUSTE: 'activeItem' ahora es una variable reactiva ---
  // Este bloque se ejecutará cada vez que la URL (y por tanto, $page) cambie.
  // Lee el hash de la URL, le quita el '#' y lo asigna a activeItem.
  // Si no hay hash, el valor por defecto es 'dashboard'.
  $: activeItem = $page.url.hash.substring(1) || 'dashboard';

  // La función de navegación no necesita cambiar. Su trabajo es simplemente
  // actualizar el hash de la URL, y la línea reactiva de arriba se encargará del resto.
  function navigate(view: string) {
    window.location.hash = view;
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
    <!-- --- NUEVO: Botón para el Modelado de Procesos --- -->
    <button class:active={activeItem === 'process-models'} on:click={() => navigate('process-models')}>
      <Icon name="network" size={24}/>
      <span class="nav-text">Modelado</span>
    </button>
		<button class:active={activeItem === 'test-modeler'} on:click={() => navigate('test-modeler')}>
      <Icon name="network" size={24}/>
      <span class="nav-text">Test Modeler</span>
    </button>
  </nav>

  <div class="sidebar-footer">
    <button class="collapse-btn" on:click={sidebarStore.toggle} title={$sidebarStore ? 'Expandir menú' : 'Colapsar menú'}>
      <Icon name={$sidebarStore ? 'chevron-right-circle' : 'chevron-left-circle'} size={24}/>
      <span class="nav-text">Colapsar</span>
    </button>
  </div>
</aside>

<style>
/* ... (estilos existentes) ... */
aside {
  width: 255px;
  background-color: var(--bg-sidebar);
  color: var(--text-sidebar);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
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
}

nav button {
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
nav button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
nav button.active {
  background-color: var(--accent-color);
  color: var(--text-sidebar-active);
}

.sidebar-footer {
  margin-top: auto;
}

.collapse-btn {
  /* Usa los mismos estilos que los botones de navegación */
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
}
.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>