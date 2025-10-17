<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { processModels } from '$lib/data/processModels';
  import { processModelDetailStore } from '$lib/stores/processModelDetailStore';
  import type { ProcessModel } from '$lib/types';

  // --- REFACTOR ---
  // The state for the modal is no longer needed.
  // let isCreatingNew: boolean = false;

  // We keep a local, mutable copy of the models to display.
  let models: ProcessModel[] = [...processModels];

  // --- REFACTOR ---
  // The save and cancel handlers for the modal are removed.
  // The logic for saving will be handled within the editor view itself.

  function handleShowDetail(model: ProcessModel) {
    processModelDetailStore.show(model);
  }
</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>Modelado de Procesos</h2>
      <p>Define, visualiza y gestiona las plantillas de tus procesos de negocio.</p>
    </div>
    <!-- --- REFACTOR: Button is now a direct link to the new editor route --- -->
    <a href="/#new-process-model" class="create-btn">
      <Icon name="plus" size={20}/>
      Crear Nuevo Modelo
    </a>
  </div>

  <!-- --- REFACTOR: The entire modal block has been removed --- -->

  <div class="models-grid">
    {#each models as model (model.id)}
      <div class="model-card" on:click={() => handleShowDetail(model)} on:keydown={() => handleShowDetail(model)} role="button" tabindex="0">
        <div class="card-header">
          <div class="card-icon"><Icon name="network" size={24}/></div>
          <h3 class="model-name">{model.name}</h3>
        </div>
        <p class="model-description">{model.description}</p>
        <div class="card-footer">
          <span class="version-chip">v{model.version}</span>
          <span>Última mod: {model.lastModified}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .view-container { display: flex; flex-direction: column; gap: 1.5rem; }
  .view-header { display: flex; justify-content: space-between; align-items: center; }
  .view-header h2 { margin: 0; }
  .view-header p { margin: 0; color: var(--text-secondary); }
  .create-btn {
    display: flex; align-items: center; gap: 0.5rem;
    background-color: var(--accent-color); color: white;
    border: none; padding: 0.75rem 1.25rem; border-radius: 8px;
    font-weight: 500; cursor: pointer; transition: opacity 0.2s;
    text-decoration: none;
  }
  .create-btn:hover { opacity: 0.9; }

  .models-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .model-card {
    display: flex;
    flex-direction: column;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .model-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px -3px rgba(0,0,0,0.07);
    border-color: var(--accent-color);
  }

  .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .card-icon {
    flex-shrink: 0;
    width: 48px; height: 48px; border-radius: 50%;
    background-color: #ebf8ff; color: var(--accent-color);
    display: flex; align-items: center; justify-content: center;
  }
  .model-name { font-size: 1.25rem; margin: 0; color: var(--text-primary); }
  .model-description { color: var(--text-secondary); flex-grow: 1; line-height: 1.6; }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-secondary); margin-top: 1.5rem;
    padding-top: 1rem; border-top: 1px solid var(--border-color);
  }
  .version-chip {
    background-color: var(--bg-primary); padding: 0.2rem 0.6rem;
    border-radius: 99px; font-weight: 500;
  }

  /* --- REFACTOR: All modal styles have been removed --- */
</style>
