<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { createEventDispatcher } from 'svelte';
  import { profilePanelStore } from '$lib/stores/profilePanelStore';
  import Icon from '$lib/components/Icon.svelte';
  import { authStore } from '$lib/stores/authStore';
  import { authService } from '$lib/services/authService';
  import { _, locale } from 'svelte-i18n';

  const dispatch = createEventDispatcher<{
    submit: { name: string; email: string };
  }>();

  let formData = { 
    name: $authStore.user?.fullName || '', 
    email: $authStore.user?.email || '' 
  };
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';

  // Reactive subscription to locale changes
  locale.subscribe((newLocale) => {
    if (newLocale && typeof window !== 'undefined') {
      window.localStorage.setItem('user-locale', newLocale);
    }
  });

  function handleSubmit() {
    dispatch('submit', { name: formData.name, email: formData.email });
  }

  function handleLogout() {
    authService.logout();
    profilePanelStore.set(false);
  }
</script>

{#if $profilePanelStore && $authStore.user}
  <div class="panel-backdrop" on:click={() => profilePanelStore.set(false)}></div>
  
  <aside class="detail-panel profile-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <div>
        <h2 class="header-title"><Icon name="user" size={28}/> {$_('profile_panel.title')}</h2>
        <p>{$_('profile_panel.subtitle')}</p>
      </div>
      <button class="close-btn" on:click={() => profilePanelStore.set(false)} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </header>

    <div class="panel-content-full">
      <div class="profile-grid">
        <div class="form-section">
          <h3>{$_('profile_panel.personal_info')}</h3>
          <div class="avatar-section">
            <img src={$authStore.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent($authStore.user.fullName)}&background=random`} alt="Avatar de {$authStore.user.fullName}" class="avatar-img"/>
            <div class="avatar-actions">
                <p>{$authStore.user.fullName}</p>
                <span>{$authStore.user.email}</span>
                <button class="upload-btn">
                    <Icon name="upload-cloud" size={16}/> {$_('profile_panel.change_photo')}
                </button>
            </div>
          </div>
          <div class="form-field">
            <label for="fullName">{$_('profile_panel.name_label')}</label>
            <input type="text" id="fullName" bind:value={formData.name}>
          </div>
          <div class="form-field">
            <label for="email">{$_('profile_panel.email_label')}</label>
            <input type="email" id="email" bind:value={formData.email} disabled>
          </div>
           <div class="form-field">
              <label for="language">{$_('profile_panel.language_label')}</label>
              <select id="language" bind:value={$locale}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
              </select>
          </div>
        </div>

        <div class="form-section">
          <h3>{$_('profile_panel.security_title')}</h3>
           <div class="form-field">
            <label for="currentPassword">{$_('profile_panel.current_password')}</label>
            <input type="password" id="currentPassword" placeholder="••••••••" bind:value={currentPassword}>
          </div>
           <div class="form-field">
            <label for="newPassword">{$_('profile_panel.new_password')}</label>
            <input type="password" id="newPassword" placeholder="Mínimo 8 caracteres" bind:value={newPassword}>
          </div>
           <div class="form-field">
            <label for="confirmPassword">{$_('profile_panel.confirm_password')}</label>
            <input type="password" id="confirmPassword" placeholder="Repite la nueva contraseña" bind:value={confirmPassword}>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3>{$_('profile_panel.roles_title')}</h3>
        <div class="form-field">
            <label>{$_('profile_panel.system_role')}</label>
            <span class="px-2 py-px text-xs font-semibold rounded-full uppercase {$authStore.user.systemRole.toLowerCase() === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300'}">{$authStore.user.systemRole}</span>
        </div>
        <div class="form-field">
            <label>{$_('profile_panel.process_roles')}</label>
            {#if $authStore.user.processRoles && $authStore.user.processRoles.length > 0}
                <div class="role-badge-group">
                    {#each $authStore.user.processRoles as roleName}
                        <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{roleName}</span>
                    {/each}
                </div>
            {:else}
                <p class="no-roles-text">{$_('profile_panel.no_process_roles')}</p>
            {/if}
        </div>
      </div>
    </div>

    <footer class="panel-footer">
        <button class="logout-btn" on:click={handleLogout}>
          <Icon name="log-out" size={16}/> {$_('profile_panel.logout_button')}
        </button>
        <div class="actions-right">
          <button class="cancel-btn" on:click={() => profilePanelStore.set(false)}>{$_('profile_panel.cancel_button')}</button>
          <button class="submit-btn" on:click={handleSubmit}>{$_('profile_panel.save_button')}</button>
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
.form-field input, .form-field select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.form-field input:disabled { background-color: var(--bg-hover); color: var(--text-secondary); }
.role-badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
}
.no-roles-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0.25rem 0 0 0;
}

.panel-footer { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-top: 1px solid var(--border-color); background-color: var(--bg-secondary); }
.actions-right { display: flex; gap: 1rem; }
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; gap: 0.5rem; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; }
.logout-btn { background-color: #f5656520; color: var(--text-primary); border-color: transparent; }
.logout-btn:hover { background-color: #f5656540; }
</style>
