<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { ProcessRole } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { toast } from '$lib/stores/toast';

  export let role: ProcessRole | {} = {};

  const dispatch = createEventDispatcher();

  let isNewRole = !('key' in role);
  let roleData: Partial<ProcessRole> = { ...role };

  let title = isNewRole ? 'Agregar Nuevo Rol' : 'Editar Rol';
  let saveButtonText = isNewRole ? 'Crear Rol' : 'Guardar Cambios';

  function closePanel() {
    dispatch('close');
  }

  function generateKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  function handleSave() {
    if (!roleData.name) {
      toast.show('El nombre del rol es obligatorio.', 'error');
      return;
    }

    if (isNewRole) {
      const newRole: ProcessRole = {
        key: generateKey(roleData.name),
        name: roleData.name,
        description: roleData.description || '',
      };
      processRoleStore.add(newRole);
      toast.show(`Rol "${newRole.name}" creado con éxito.`, 'success');
    } else {
      processRoleStore.update(roleData as ProcessRole);
      toast.show(`Rol "${roleData.name}" actualizado.`, 'success');
    }

    closePanel();
  }

  onMount(() => {
    const input = document.querySelector('#roleName') as HTMLInputElement;
    if (input) input.focus();
  });
</script>

<div class="panel-overlay" on:click={closePanel} transition:slide={{ duration: 300, easing: quintOut }}>
  <div class="panel-content" on:click|stopPropagation transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <h2 class="panel-title">{title}</h2>
      <button class="btn-close" on:click={closePanel}>
        <Icon name="x" />
      </button>
    </header>

    <div class="panel-body">
      <form on:submit|preventDefault={handleSave}>
        <div class="form-group">
          <label for="roleName" class="form-label">Nombre del Rol</label>
          <input
            type="text"
            id="roleName"
            class="form-input"
            placeholder="Ej: Aprobador de Contratos"
            bind:value={roleData.name}
            required
          />
        </div>

        <div class="form-group">
          <label for="roleDescription" class="form-label">Descripción</label>
          <textarea
            id="roleDescription"
            class="form-textarea"
            rows="4"
            placeholder="Describe la responsabilidad principal de este rol..."
            bind:value={roleData.description}
          ></textarea>
        </div>
      </form>
    </div>

    <footer class="panel-footer">
      <button class="btn btn-secondary" on:click={closePanel}>Cancelar</button>
      <button class="btn btn-primary" on:click={handleSave}>{saveButtonText}</button>
    </footer>
  </div>
</div>

<style>
  .panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: flex-end; }
  .panel-content { background: var(--bg-primary); width: 100%; max-width: 480px; height: 100%; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
  .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .panel-title { font-size: 1.25rem; font-weight: 600; }
  .btn-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
  .panel-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; }
  .form-input, .form-textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); font-size: 1rem; color: var(--text-primary); transition: all 0.2s; }
  .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-color-light); }
  .panel-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; background: var(--bg-primary); }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-primary:hover { filter: brightness(1.1); }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background: var(--bg-tertiary); }
</style>
