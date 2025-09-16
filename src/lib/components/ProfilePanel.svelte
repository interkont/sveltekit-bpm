<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { createEventDispatcher } from 'svelte';
  import { profilePanelStore } from '$lib/stores/profilePanelStore';
  import Icon from '$lib/components/Icon.svelte';
  import { authStore } from '$lib/stores/authStore';
  import { userStore } from '$lib/stores/userStore';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import type { User, ProcessRole } from '$lib/types';

  const dispatch = createEventDispatcher<{
    submit: { name: string; email: string };
  }>();

  // Estado local para el formulario y la información del usuario
  let formData = { name: '', email: '' };
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let currentUser: User | undefined;
  let processRoles: ProcessRole[] = [];

  // Suscribirse a los roles de proceso para obtener sus nombres
  processRoleStore.subscribe(value => {
    processRoles = value;
  });

  // Bloque reactivo para sincronizar datos al abrir el panel
  $: if ($authStore.user?.uid && $profilePanelStore) {
    currentUser = $userStore.find(u => u.uid === $authStore.user.uid);
    if (currentUser) {
      formData = {
        name: currentUser.displayName,
        email: currentUser.email,
      };
    }
    // Reiniciar campos de contraseña al abrir
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
  }

  // Tailwind classes for process role tags
  const tagColors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  ];
  // Helper para obtener el nombre de un rol a partir de su clave
  function getRoleName(roleKey: string): string {
    const role = processRoles.find(r => r.key === roleKey);
    return role ? role.name : roleKey;
  }

  function handleSubmit() {
    // Aquí se podría actualizar el userStore antes de enviar
    dispatch('submit', { name: formData.name, email: formData.email });
    // Idealmente, también se actualizaría el userStore aquí.
  }

  function handleLogout() {
    authStore.logout();
    profilePanelStore.set(false);
  }
</script>

{#if $profilePanelStore && currentUser}
  <div class="panel-backdrop" on:click={() => profilePanelStore.set(false)}></div>
  
  <aside class="detail-panel profile-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <div>
        <h2 class="header-title"><Icon name="user" size={28}/> Mi Perfil</h2>
        <p>Gestiona tu información personal y de seguridad.</p>
      </div>
      <button class="close-btn" on:click={() => profilePanelStore.set(false)} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </header>

    <div class="panel-content-full">
      <div class="profile-grid">
        <!-- Columna de Información Personal -->
        <div class="form-section">
          <h3>Información Personal</h3>
          <div class="avatar-section">
            <img src={currentUser.avatarUrl} alt="Avatar de {currentUser.displayName}" class="avatar-img"/>
            <div class="avatar-actions">
                <p>{currentUser.displayName}</p>
                <span>{currentUser.email}</span>
                <button class="upload-btn">
                    <Icon name="upload-cloud" size={16}/> Cambiar Foto
                </button>
            </div>
          </div>
          <div class="form-field">
            <label for="fullName">Nombre Completo</label>
            <input type="text" id="fullName" bind:value={formData.name}>
          </div>
          <div class="form-field">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" bind:value={formData.email} disabled>
          </div>
        </div>

        <!-- Columna de Seguridad -->
        <div class="form-section">
          <h3>Seguridad y Contraseña</h3>
           <div class="form-field">
            <label for="currentPassword">Contraseña Actual</label>
            <input type="password" id="currentPassword" placeholder="••••••••" bind:value={currentPassword}>
          </div>
           <div class="form-field">
            <label for="newPassword">Nueva Contraseña</label>
            <input type="password" id="newPassword" placeholder="Mínimo 8 caracteres" bind:value={newPassword}>
          </div>
           <div class="form-field">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirmPassword" placeholder="Repite la nueva contraseña" bind:value={confirmPassword}>
          </div>
        </div>
      </div>
      
      <!-- === NUEVA SECCIÓN DE ROLES === -->
      <div class="form-section">
        <h3>Tus Roles</h3>
        <div class="form-field">
            <label>Rol de Sistema</label>
            <span class="px-2 py-px text-xs font-semibold rounded-full uppercase {currentUser.systemRole === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300'}">{currentUser.systemRole}</span>
        </div>
        <div class="form-field">
            <label>Roles de Proceso</label>
            {#if currentUser.processRoles && currentUser.processRoles.length > 0}
                <div class="role-badge-group">
                    {#each currentUser.processRoles as roleKey}
                        <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{getRoleName(roleKey)}</span>
                    {/each}
                </div>
            {:else}
                <p class="no-roles-text">No tienes roles de proceso asignados.</p>
            {/if}
        </div>
      </div>
    </div>

    <footer class="panel-footer">
        <button class="logout-btn" on:click={handleLogout}>
          <Icon name="log-out" size={16}/> Cerrar Sesión
        </button>
        <div class="actions-right">
          <button class="cancel-btn" on:click={() => profilePanelStore.set(false)}>Cancelar</button>
          <button class="submit-btn" on:click={handleSubmit}>Guardar Cambios</button>
        </div>
    </footer>
  </aside>
{/if}

<style>
/* Estilos generales del panel (sin cambios) */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1200;
}
.profile-panel {
  width: 50vw; max-width: 800px;
  background-color: var(--bg-secondary);
  z-index: 1201;
  position: fixed; top: 0; right: 0; height: 100vh;
  box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.header-title { display: flex; align-items: center; gap: 1rem; margin: 0; }
.panel-header p { margin: 0.25rem 0 0 0; color: var(--text-secondary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
.panel-content-full { flex-grow: 1; overflow-y: auto; padding: 2rem; }
.profile-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; padding-bottom: 2rem; }
@media (min-width: 768px) { .profile-grid { grid-template-columns: 1fr 1fr; } }

.form-section h3 {
    font-size: 1.25rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
    margin: 0 0 1.5rem 0;
}
.avatar-section { display: flex; align-items: center; gap: 1.5rem; background-color: var(--bg-primary); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
.avatar-img { width: 80px; height: 80px; border-radius: 50%; }
.avatar-actions p { margin: 0; font-weight: 600; font-size: 1.1rem; }
.avatar-actions span { font-size: 0.9rem; color: var(--text-secondary); }
.upload-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem 1rem; border-radius: 6px; margin-top: 0.5rem; cursor: pointer; }
.form-field { margin-bottom: 1.5rem; }
.form-field label { display: block; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; }
.form-field input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.form-field input:disabled { background-color: var(--bg-hover); color: var(--text-secondary); }

/* === NUEVOS ESTILOS PARA ROLES === */
.role-badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
}
.role-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    display: inline-block;
}
.system-role {
    background-color: #28a74520;
    color: #28a745;
}
.process-role {
    background-color: #17a2b820;
    color: #17a2b8;
}
.no-roles-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0.25rem 0 0 0;
}

/* Estilos del Footer (sin cambios) */
.panel-footer { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-top: 1px solid var(--border-color); background-color: var(--bg-secondary); }
.actions-right { display: flex; gap: 1rem; }
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; gap: 0.5rem; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; }
.logout-btn { background-color: #f5656520; color: var(--text-primary); border-color: transparent; }
.logout-btn:hover { background-color: #f5656540; }
</style>