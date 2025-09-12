<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import Icon from '$lib/components/Icon.svelte';

  // --- AJUSTE: Se añaden los tipos a cada prop ---
  export let title: string = 'Confirmar Acción';
  export let message: string = '¿Estás seguro de que deseas continuar?';
  export let confirmText: string = 'Confirmar';
  export let cancelText: string = 'Cancelar';
  export let show: boolean = false;

  const dispatch = createEventDispatcher();

  // --- AJUSTE: Se añade el tipo 'KeyboardEvent' al parámetro ---
  function handleKeydown(event: KeyboardEvent) {
    if (show && event.key === 'Escape') {
      dispatch('cancel');
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if show}
  <div class="modal-backdrop" on:click={() => dispatch('cancel')} transition:fly={{ y: 10, duration: 200, opacity: 0 }}></div>

  <div class="modal" role="dialog" aria-labelledby="modal-title" transition:fly={{ y: -20, duration: 300, opacity: 0 }}>
    <div class="modal-content">
      <div class="icon-container">
        <Icon name="alert-triangle" size={24} />
      </div>
      <div class="text-container">
        <h2 id="modal-title">{title}</h2>
        <p>{message}</p>
      </div>
    </div>
    <div class="modal-actions">
      <button class="cancel" on:click={() => dispatch('cancel')}>{cancelText}</button>
      <button class="confirm" on:click={() => dispatch('confirm')}>{confirmText}</button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); 
    z-index: 1100; /* Aumentado para estar sobre el panel de tarea */
  }
  .modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background-color: white; border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    width: 90%; max-width: 450px; 
    z-index: 1101; /* Aumentado para estar sobre el backdrop */
  }
  .modal-content { display: flex; padding: 1.5rem; gap: 1rem; }
  .icon-container {
    flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%;
    background-color: #fefcbf; display: flex; align-items: center;
    justify-content: center; color: #f59e0b;
  }
  .text-container { text-align: left; }
  h2 { margin: 0 0 0.5rem 0; font-size: 1.125rem; color: #2d3748; }
  p { margin: 0; font-size: 0.9rem; color: #718096; }
  .modal-actions {
    display: flex; gap: 0.75rem; padding: 1rem 1.5rem;
    background-color: #f9fafb; border-top: 1px solid #e2e8f0;
    border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
    justify-content: flex-end;
  }
  button {
    border: 1px solid transparent; padding: 0.5rem 1rem;
    border-radius: 6px; font-weight: 500; cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }
  .cancel { background-color: white; color: #2d3748; border-color: #d1d5db; }
  .cancel:hover { background-color: #f9fafb; }
  .confirm { background-color: #e53e3e; color: white; }
  .confirm:hover { background-color: #c53030; }
</style>