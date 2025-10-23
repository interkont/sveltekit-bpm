<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // --- MODIFICACIÓN ---
  // Ahora `items` puede ser un array de strings o de objetos con `key` y `label`.
  export let items: (string | { key: string; label: string })[] = [];
  
  // El estado interno ahora maneja el objeto completo si es el caso.
  let activeItem: string | { key: string; label: string } = items[0];

  const dispatch = createEventDispatcher();

  function selectItem(item: string | { key: string; label: string }) {
    if (item !== activeItem) {
      activeItem = item;
      // El evento despachado sigue devolviendo el objeto completo para máxima información.
      dispatch('tabChange', {
        tab: item
      });
    }
  }

  // --- NUEVA FUNCIÓN ---
  // Función helper para obtener el valor a mostrar en la UI.
  function getLabel(item: string | { key: string; label: string }): string {
    return typeof item === 'object' ? item.label : item;
  }
</script>

<div class="tabs-container">
  {#each items as item}
    <button 
      class="tab-item" 
      class:active={activeItem === item} 
      on:click={() => selectItem(item)}>
      <!-- Usamos la función getLabel para mostrar el texto correcto -->
      {getLabel(item)}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    border-bottom: 2px solid var(--border-color);
  }

  .tab-item {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 500;
    position: relative;
    top: 2px;
    border-bottom: 2px solid transparent;
    transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  }

  .tab-item:hover {
    color: var(--text-primary);
  }

  .tab-item.active {
    color: var(--accent-color);
    font-weight: 600;
    border-bottom-color: var(--accent-color);
  }
</style>
