<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { processDefinitionService } from '$lib/services/processDefinitionService';
  import type { ProcessDefinition } from '$lib/types';
  import { toast } from '$lib/stores/toast';

  let definitions: ProcessDefinition[] = [];
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      isLoading = true;
      definitions = await processDefinitionService.getAllProcesses();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.show('Failed to load process models: ' + error, 'error');
    } finally {
      isLoading = false;
    }
  });

</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>Modelado de Procesos</h2>
      <p>Define, visualiza y gestiona las plantillas de tus procesos de negocio.</p>
    </div>
    <a href="/#new-process-model" class="create-btn">
      <Icon name="plus" size={20}/>
      Crear Nuevo Modelo
    </a>
  </div>

  {#if isLoading}
    <div class="loading-state">
      <p>Cargando modelos de proceso...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>Error: {error}</p>
    </div>
  {:else}
    <div class="models-grid">
      {#each definitions as def (def.id)}
        <a href="/#process-model-detail/{def.id}" class="model-card">
          <div class="card-header">
            <div class="card-icon"><Icon name="network" size={24}/></div>
            <h3 class="model-name">{def.name}</h3>
          </div>
          <p class="model-description">{def.description}</p>
          <div class="card-footer">
            <span class="version-chip">v{def.version}</span>
            <span 
              class:status-active={def.status === 'ACTIVE'} 
              class:status-draft={def.status === 'DRAFT'}
              class:status-deprecated={def.status === 'DEPRECATED'}
            >
              {def.status}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
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
    text-decoration: none; /* Remove underline from link */
    color: inherit; /* Inherit text color */
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
  .status-active { color: #16a34a; font-weight: 600; }
  .status-draft { color: #ca8a04; font-weight: 600; }
  .status-deprecated { color: #7f1d1d; font-weight: 600; }
  .loading-state, .error-state { text-align: center; padding: 2rem; }
</style>
