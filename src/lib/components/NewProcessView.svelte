<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { processDefinitionStore } from '$lib/stores/processDefinitionStore';
    import type { ProcessDefinition } from '$lib/types';
  
    const dispatch = createEventDispatcher();
  
    onMount(() => {
      processDefinitionStore.fetchDefinitions();
    });
  
    function goBack() {
      dispatch('navigate', { view: 'processes' });
    }
  
    function handleSelect(definition: ProcessDefinition) {
      // Navigate to the form view, passing the selected definition
      dispatch('navigate', { view: 'start-process-form', context: definition });
    }
  </script>
  
  <div class="view-container">
    <div class="view-header">
       <button class="back-btn" on:click={goBack}>
         <Icon name="chevron-left" />
         Volver a la Lista
       </button>
    </div>
    <div class="title">
      <h2>Crear Nuevo Proceso</h2>
      <p>Selecciona el tipo de proceso que deseas iniciar.</p>
    </div>
  
    <div class="list-container">
      {#if $processDefinitionStore.loading}
        <div class="state-placeholder">
          <Icon name="loader" size={24} spinning={true} />
          <span>Cargando procesos disponibles...</span>
        </div>
      {:else if $processDefinitionStore.error}
        <div class="state-placeholder error">
          <Icon name="alert-triangle" size={24} />
          <span>Error al cargar: {$processDefinitionStore.error}</span>
        </div>
      {:else if $processDefinitionStore.definitions.length === 0}
        <div class="state-placeholder">
          <Icon name="inbox" size={24} />
          <span>No hay procesos disponibles para iniciar.</span>
        </div>
      {:else}
        <div class="process-type-list">
          {#each $processDefinitionStore.definitions as def (def.id)}
            <div class="type-card">
              <div class="card-icon">
                <Icon name="file-plus-2" />
              </div>
              <h3>{def.name}</h3>
              <p>{def.description}</p>
              <button class="select-btn" on:click={() => handleSelect(def)}>
                Seleccionar
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .view-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .view-header { display: flex; }
    .title h2 { margin: 0; color: var(--text-primary); }
    .title p { margin: 0; color: var(--text-secondary); }
  
    .back-btn {
      display: flex; align-items: center; gap: 0.5rem;
      background: none; border: none; font-size: 1rem;
      color: var(--text-secondary); cursor: pointer; font-weight: 500;
    }
    .back-btn:hover { color: var(--text-primary); }
    
    .list-container { min-height: 300px; display: flex; flex-direction: column; }
    .state-placeholder {
      display: flex; align-items: center; justify-content: center;
      flex-grow: 1; gap: 1rem; color: var(--text-secondary);
      border: 2px dashed var(--border-color); border-radius: 12px;
    }
    .state-placeholder.error { color: #c53030; background-color: #f5656520; }
  
    .process-type-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .type-card {
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      transition: all 0.2s ease-in-out;
    }
    .type-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      border-color: var(--accent-color);
    }
  
    .card-icon {
      margin: 0 auto 1.5rem auto;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--accent-color-light, #ebf4ff);
      color: var(--accent-color);
    }
  
    .type-card h3 { margin: 0 0 0.5rem 0; color: var(--text-primary); }
    .type-card p { color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.5; }
  
    .select-btn {
      width: 100%;
      background-color: var(--accent-color); color: white;
      border: none; padding: 0.75rem 1.5rem; border-radius: 8px;
      font-weight: 500; cursor: pointer; transition: background-color 0.2s;
    }
    .select-btn:hover { background-color: #3730a3; }
  </style>