<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Prop: Un array de strings con los nombres de las pestañas.
  export let items: string[] = [];
  
  // Estado: Mantiene el registro de la pestaña activa actualmente.
  let activeItem: string = items[0];

  const dispatch = createEventDispatcher();

  function selectItem(item: string) {
    if (item !== activeItem) {
      activeItem = item;
      // Despacha un evento para que el componente padre sepa que la pestaña ha cambiado.
      dispatch('tabChange', {
        tab: item
      });
    }
  }
</script>

<div class="tabs-container">
  {#each items as item}
    <button 
      class="tab-item" 
      class:active={activeItem === item} 
      on:click={() => selectItem(item)}>
      {item}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    border-bottom: 2px solid var(--border-color);
    margin-bottom: 2rem;
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
    top: 2px; /* Alinea el borde inferior del botón con el borde del contenedor */
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
