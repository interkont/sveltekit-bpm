<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import Icon from '$lib/components/Icon.svelte';
  import { profilePanelStore } from '$lib/stores/profilePanelStore';
  import { authStore } from '$lib/stores/authStore';
  import { userStore } from '$lib/stores/userStore';
  import { derived } from 'svelte/store'; // --- 1. Importar derived

  // --- 2. Crear un store derivado para el usuario actual ---
  const currentUserStore = derived(
    [authStore, userStore], // Dependencias
    ([$authStore, $userStore]) => { // Valores de los stores
      if ($authStore.user?.uid && $userStore.length > 0) {
        return $userStore.find(u => u.uid === $authStore.user.uid);
      }
      return undefined;
    }
  );

</script>

<header>
	<div class="search-bar">
    <Icon name="search" size={20}/>
    <input type="text" placeholder="Buscar procesos, tareas o usuarios...">
  </div>

	<div class="header-actions">
		<button on:click={theme.toggle} class="theme-toggle" title="Cambiar tema">
			{#if $theme === 'light'}
				<Icon name="moon" size={22} />
			{:else}
				<Icon name="sun" size={22} />
			{/if}
		</button>
		
		<button class="relative text-[var(--text-secondary)] hover:text-[var(--accent-color)]" title="Notificaciones">
			<Icon name="bell" size={22} />
			<span class="absolute -top-1 -right-1 flex h-3 w-3">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
			</span>
		</button>
		
		<div class="w-px h-6 bg-[var(--border-color)]"></div>

		<!-- --- 3. Usar el nuevo store derivado en el HTML --- -->
		{#if $currentUserStore}
			<div class="user-profile" on:click={() => profilePanelStore.set(true)} title="Gestionar Perfil">
				<img src={$currentUserStore.avatarUrl} alt="Avatar de usuario">
				<div class="user-info">
					<span class="user-name">{$currentUserStore.displayName}</span>
					<span class="user-role">{$currentUserStore.systemRole}</span>
				</div>
			</div>
		{/if}
	</div>
</header>

<style>
/* Estilos sin cambios */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}
.search-bar svg { color: var(--text-secondary); }
.search-bar input {
  background: none; border: none; outline: none;
  width: 100%; color: var(--text-primary); font-size: 1rem;
}
.search-bar input::placeholder { color: var(--text-secondary); }

.header-actions { display: flex; align-items: center; gap: 1.5rem; }
.theme-toggle {
  background: none; border: none; cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.user-profile { display: flex; align-items: center; gap: 1rem; cursor: pointer; }
.user-profile img { width: 40px; height: 40px; border-radius: 50%; }
.user-info .user-name { font-weight: 500; text-transform: capitalize; }
.user-info .user-role { font-size: 0.85rem; color: var(--text-secondary); text-transform: capitalize; }

.relative { position: relative; }
.absolute { position: absolute; }
.w-px { width: 1px; }
.h-6 { height: 1.5rem; }
.bg-\[var\(--border-color\)\] { background-color: var(--border-color); }
.text-\[var\(--text-secondary\)\] { color: var(--text-secondary); }
.hover\:text-\[var\(--accent-color\)\]:hover { color: var(--accent-color); }
.-top-1 { top: -0.25rem; }
.-right-1 { right: -0.25rem; }
.flex { display: flex; }
.h-3 { height: 0.75rem; }
.w-3 { width: 0.75rem; }
.animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.inline-flex { display: inline-flex; }
.h-full { height: 100%; }
.w-full { width: 100%; }
.rounded-full { border-radius: 9999px; }
.bg-red-400 { background-color: #f87171; }
.opacity-75 { opacity: 0.75; }
.bg-red-500 { background-color: #ef4444; }
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>