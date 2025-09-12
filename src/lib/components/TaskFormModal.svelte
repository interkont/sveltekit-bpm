<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  // --- AJUSTE: Se actualiza la ruta de importación ---
  import Icon from '$lib/components/Icon.svelte';
  // --- AJUSTE: Importamos el tipo de dato para una Tarea ---
  import type { Task } from '$lib/types';

  // --- AJUSTE: Se añaden los tipos a las props ---
  export let show: boolean = false;
  export let task: Task | null = null;

  // --- AJUSTE: Se define el "contrato" para los eventos que emite el componente ---
  const dispatch = createEventDispatcher<{
    submit: { action: string; comments: string };
    close: void;
  }>();

  // --- AJUSTE: Se crea una interface local para describir las acciones disponibles ---
  interface FormAction {
    id: 'approve' | 'reject' | 'request_info';
    label: string;
  }

  const availableActions: FormAction[] = [
    { id: 'approve', label: 'Aprobar' },
    { id: 'reject', label: 'Rechazar' },
    { id: 'request_info', label: 'Solicitar más información' }
  ];

  // --- AJUSTE: Se tipan las variables de estado ---
  let selectedAction: FormAction['id'] = 'approve';
  let comments: string = '';

  function handleSubmit() {
    // La lógica de la función no cambia
    dispatch('submit', {
      action: selectedAction,
      comments: comments
    });
  }

  // --- AJUSTE: Se tipa el parámetro 'event' ---
  function handleKeydown(event: KeyboardEvent) {
    if (show && event.key === 'Escape') {
      dispatch('close');
    }
  }

  // La lógica del bloque reactivo no cambia
  $: if (!show) {
    selectedAction = 'approve';
    comments = '';
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if show && task}
  <div class="modal-backdrop" on:click={() => dispatch('close')} transition:fly={{ y: 10, duration: 200, opacity: 0 }}></div>

  <div class="modal" role="dialog" aria-labelledby="form-title" transition:fly={{ y: -20, duration: 300, opacity: 0 }}>
    <div class="modal-header">
      <h2 id="form-title">{task.taskName}</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>
        <Icon name="x" size={24} />
      </button>
    </div>

    <div class="modal-body">
      <h4>Detalles del Proceso</h4>
      <p><strong>ID Proceso:</strong> {task.processName}</p>
      
      <!-- Simulación de un formulario con datos de negocio -->
      <div class="form-simulation">
        <p>Aquí iría el formulario específico de la tarea con todos sus campos y datos de negocio para que el usuario pueda revisarlos.</p>
        <div class="placeholder-box">Formulario de Tarea</div>
      </div>

      <h4>Acción a Realizar</h4>
      <div class="form-group">
        <label for="action-select">Selecciona una acción:</label>
        <select id="action-select" bind:value={selectedAction}>
          {#each availableActions as action}
            <option value={action.id}>{action.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="comments">Comentarios (opcional):</label>
        <textarea id="comments" rows="3" placeholder="Añade tus comentarios aquí..." bind:value={comments}></textarea>
      </div>
    </div>

    <div class="modal-actions">
      <button class="cancel" on:click={() => dispatch('close')}>Cancelar</button>
      <button class="submit" on:click={handleSubmit}>Finalizar Tarea</button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop { z-index: 1000; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); }
  .modal {
    z-index: 1001; position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg-secondary);
    border-radius: 12px; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.2);
    width: 90%; max-width: 600px; display: flex; flex-direction: column; max-height: 85vh;
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);
  }
  h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
  .close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.25rem; }
  .close-btn:hover { color: var(--text-primary); }

  .modal-body { padding: 1.5rem; overflow-y: auto; }
  h4 { margin-top: 0; margin-bottom: 1rem; color: var(--text-primary); }
  p { margin-top: 0; margin-bottom: 0.5rem; color: var(--text-secondary); }
  
  .form-simulation { margin: 1.5rem 0; }
  .placeholder-box {
    border: 2px dashed var(--border-color); border-radius: 8px;
    padding: 2rem; text-align: center; color: var(--text-secondary);
    background-color: var(--bg-primary);
  }

  .form-group { margin-bottom: 1rem; }
  label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary); }
  select, textarea {
    width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
    border-radius: 6px; background-color: var(--bg-secondary); color: var(--text-primary);
    font-size: 1rem;
  }

  .modal-actions {
    display: flex; justify-content: flex-end; gap: 0.75rem;
    padding: 1rem 1.5rem; background-color: var(--bg-primary);
    border-top: 1px solid var(--border-color); border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
  button { border: 1px solid transparent; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .cancel { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
  .cancel:hover { background-color: var(--bg-hover); }
  .submit { background-color: var(--accent-color); color: white; }
  .submit:hover { opacity: 0.9; }
</style>