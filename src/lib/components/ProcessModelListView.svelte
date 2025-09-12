<script lang="ts">
  // --- AJUSTE: Se actualizan las rutas de importación ---
  import Icon from '$lib/components/Icon.svelte';
  import { processModels } from '$lib/data/processModels';
  import { processModelDetailStore } from '$lib/stores/processModelDetailStore';
  import ModelerNew from '$lib/components/ModelerNew.svelte';
  // --- AJUSTE: Importamos el tipo de dato para un modelo de proceso ---
  import type { ProcessModel } from '$lib/types';

  // --- AJUSTE: Se tipa la variable de estado ---
  let isCreatingNew: boolean = false;

  // --- AJUSTE: Se aplica el tipo 'ProcessModel[]' a nuestro array de modelos ---
  // Tu lógica para crear una copia local mutable es excelente y se conserva.
  let models: ProcessModel[] = [...processModels];

  /**
   * Maneja el evento 'save' emitido por ModelerNew.
   * Recibe { xml } y crea un nuevo objeto modelo.
   */
  // --- AJUSTE: Se tipa el parámetro 'event' ---
  function handleSaveNew(event: CustomEvent<{ xml: string }>) {
    const { xml } = event.detail;

    // TypeScript ahora verificará que 'newModel' cumpla con la interface 'ProcessModel'
    const newModel: ProcessModel = {
      id: `MODEL-${Date.now()}`,
      name: 'Nuevo Proceso (Editar)',
      description: 'Modelo recién creado desde el editor.',
      version: '1.0',
      lastModified: new Date().toLocaleDateString(),
      bpmnXml: xml
    };

    // Agregar a la copia local para actualizar la vista
    models = [newModel, ...models];

    // Intentar mutar el array original si es realmente un array
    try {
      if (Array.isArray(processModels)) {
        processModels.push(newModel);
      }
    } catch (e) {
      // si no se puede mutar (import inmutable), simplemente dejamos la copia local
      console.warn('No se pudo mutar processModels importado (no es mutable). Usando copia local `models` para renderizar.');
    }

    isCreatingNew = false;
  }

  function handleCancelNew() {
    isCreatingNew = false;
  }

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
    <button class="create-btn" on:click={() => (isCreatingNew = true)}>
      <Icon name="plus" size={20}/>
      Crear Nuevo Modelo
    </button>
  </div>

  <!-- Modal / panel del Modeler para crear nuevo modelo -->
  {#if isCreatingNew}
    <div class="modeler-modal" role="dialog" aria-modal="true">
      <div class="modeler-modal-backdrop" on:click={handleCancelNew}></div>
      <div class="modeler-modal-content">
        <header class="modeler-modal-header">
          <h3>Crear Nuevo Modelo</h3>
          <button class="close-btn" on:click={handleCancelNew} aria-label="Cerrar">
            <Icon name="x" size={20} />
          </button>
        </header>

        <!-- Montamos tu ModelerNew y escuchamos save & cancel -->
        <ModelerNew on:save={handleSaveNew} on:cancel={handleCancelNew} />
      </div>
    </div>
  {/if}

  <div class="models-grid">
    {#each models as model (model.id)}
      <!-- Mantengo exactamente tu card original -->
      <div class="model-card" on:click={() => processModelDetailStore.show(model)} on:keydown={() => processModelDetailStore.show(model)} role="button" tabindex="0">
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
  .model-description {
    color: var(--text-secondary);
    flex-grow: 1;
    line-height: 1.6;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
  .version-chip {
    background-color: var(--bg-primary);
    padding: 0.2rem 0.6rem;
    border-radius: 99px;
    font-weight: 500;
  }

  /* Estilos para el modal del Modeler (simple) */
  .modeler-modal {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modeler-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
  }
  .modeler-modal-content {
    position: relative;
    width: 95%;
    max-width: 1400px;
    height: 85vh;
    background: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(2,6,23,0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .modeler-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
  }
  .modeler-modal .close-btn {
    background: none;
    border: none;
    cursor: pointer;
  }

  /* Aseguramos que el contenido del Modeler (componente) ocupe todo el modal */
  .modeler-modal > .modeler-modal-content > :global(*) {
    flex: 1 1 auto;
  }
</style>