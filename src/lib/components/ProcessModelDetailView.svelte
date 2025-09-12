<script lang="ts">
  import { onDestroy, tick, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { browser } from '$app/environment';

  import { processModelDetailStore } from '$lib/stores/processModelDetailStore';
  import Icon from '$lib/components/Icon.svelte';
  import { toast } from '$lib/stores/toast';
  import type { ProcessModel } from '$lib/types';

  export let model: ProcessModel;

  let canvas: HTMLElement;
  let propertiesContainer: HTMLElement;
  let bpmnViewer: any = null;
  let bpmnModeler: any = null;
  let isLoading = false;
  let isEditing = false;

  // Caches para los módulos cargados dinámicamente, tal como en tu código original
  let ViewerModule: any = null;
  let ModelerModule: any = null;
  let PropertiesPanelModule: any = null;
  let PropertiesProviderModule: any = null;

  // Reaccionar a cambios en el modelo para recargar el diagrama
  $: if (browser && model) {
    // Usar 'tick' para asegurar que el DOM se actualice antes de actuar
    tick().then(() => {
      if (isEditing) {
        // Si ya estamos en modo edición, lo reiniciamos
        enableEditing();
      } else {
        // Si no, reiniciamos el viewer
        initializeViewer();
      }
    });
  }

  // Inicializa solo el VIEWER (modo consulta)
  async function initializeViewer() {
    if (!canvas || bpmnModeler) return; // No hacer nada si el canvas no está o si estamos en modo modeler
    
    // Destruir instancia previa de viewer para evitar duplicados
    if (bpmnViewer) {
        try { bpmnViewer.destroy(); } catch (e) { /* Silenciar error */ }
        bpmnViewer = null;
    }

    isLoading = true;
    try {
      if (!ViewerModule) {
        // Importación dinámica LOCAL del Viewer
        const mod = await import('bpmn-js/lib/Viewer');
        ViewerModule = mod.default;
      }

      bpmnViewer = new ViewerModule({ container: canvas });

      if (model?.bpmnXml) {
        await bpmnViewer.importXML(model.bpmnXml);
        bpmnViewer.get('canvas').zoom('fit-viewport');
      }
    } catch (err) {
      console.error('[initializeViewer] Error:', err);
      toast.show('Error al mostrar el diagrama.', 'error');
    } finally {
      isLoading = false;
    }
  }

  // Habilita el modo edición (Modeler)
  async function enableEditing() {
    if (!model) return;
    isEditing = true;
    isLoading = true;

    try {
      // Destruir viewer si existe
      if (bpmnViewer) {
        try { bpmnViewer.destroy(); } catch (e) { /* Silenciar error */ }
        bpmnViewer = null;
      }

      if (!ModelerModule) {
        // Importaciones dinámicas LOCALES
        const modelerMod = await import('bpmn-js/lib/Modeler');
        const propsPanelMod = await import('bpmn-js-properties-panel');
        
        ModelerModule = modelerMod.default;
        PropertiesPanelModule = propsPanelMod.BpmnPropertiesPanelModule;
        PropertiesProviderModule = propsPanelMod.BpmnPropertiesProviderModule;
      }
      
      // Esperar a que el contenedor de properties esté en el DOM
      await tick();

      bpmnModeler = new ModelerModule({
        container: canvas,
        propertiesPanel: { parent: propertiesContainer },
        additionalModules: [PropertiesPanelModule, PropertiesProviderModule],
        keyboard: { bindTo: document }
      });

      if (model.bpmnXml) {
        await bpmnModeler.importXML(model.bpmnXml);
        bpmnModeler.get('canvas').zoom('fit-viewport');
      }
    } catch (err) {
      console.error('[enableEditing] Error:', err);
      toast.show('No se pudo activar el modo edición.', 'error');
      isEditing = false; // Revertir si falla
    } finally {
      isLoading = false;
    }
  }

  async function saveChanges() {
    if (!bpmnModeler) return;
    isLoading = true;
    try {
      const { xml } = await bpmnModeler.saveXML({ format: true });
      model.bpmnXml = xml;
      // AQUÍ iría la lógica para persistir el cambio en el backend
      toast.show('Cambios guardados.', 'success');
      await cancelEditing(); // Volver al modo viewer
    } catch (err) {
      console.error('Error al guardar cambios', err);
      toast.show('Error al guardar.', 'error');
    } finally {
      isLoading = false;
    }
  }

  async function cancelEditing() {
    if (bpmnModeler) {
      try { bpmnModeler.destroy(); } catch (e) { /* Silenciar error */ }
      bpmnModeler = null;
    }
    isEditing = false;
    await tick();
    initializeViewer(); // Volver al modo viewer
  }
  
  // Llamada inicial cuando el panel se muestra
  function handleIntroEnd() {
    if (model) {
        initializeViewer();
    }
  }

  onDestroy(() => {
    if (bpmnViewer) try { bpmnViewer.destroy(); } catch (_) {}
    if (bpmnModeler) try { bpmnModeler.destroy(); } catch (_) {}
  });
</script>

<div 
  class="panel-backdrop" 
  on:click={processModelDetailStore.hide}
  on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') processModelDetailStore.hide() }}
  role="button"
  tabindex="0"
  aria-label="Cerrar panel de detalle"
></div>

<aside 
  class="detail-panel" 
  transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}
  on:introend={handleIntroEnd}
>
  <header class="panel-header">
    <div>
      <span class="header-subtitle">Modelo de Proceso</span>
      <h2 title={model?.name}>{model?.name}</h2>
      <p>ID: {model?.id} | Versión: {model?.version}</p>
    </div>
    <div class="header-actions">
      {#if isEditing}
        <button class="action-btn save-btn" on:click={saveChanges} disabled={isLoading}><Icon name="save" size={18}/> Guardar</button>
        <button class="action-btn cancel-btn" on:click={cancelEditing} disabled={isLoading}><Icon name="x" size={18}/> Cancelar</button>
      {:else}
        <button class="action-btn" on:click={enableEditing} disabled={isLoading}><Icon name="edit" size={18}/> Editar</button>
      {/if}
      <button class="action-btn close-btn" on:click={processModelDetailStore.hide} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </div>
  </header>

  <div class="panel-content">
    {#if isLoading}
      <div class="loading-overlay">
        <Icon name="loader" size={48} class="spinner"/>
        <span>Cargando Diagrama...</span>
      </div>
    {/if}
    <div class="bpmn-container">
      <div bind:this={canvas} class="diagram"></div>
      {#if isEditing}
        <div bind:this={propertiesContainer} class="properties"></div>
      {/if}
    </div>
  </div>
</aside>

<style>
  .panel-backdrop {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1050;
    cursor: pointer;
  }
  .detail-panel {
    position: fixed; top: 0; right: 0;
    width: 90vw;
    max-width: 1600px;
    height: 100vh;
    background-color: var(--bg-primary);
    box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
    z-index: 1051;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }
  .header-subtitle {
    font-size: 0.9rem;
    color: var(--accent-color);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .panel-header h2 { margin: 0.25rem 0; color: var(--text-primary); font-size: 1.75rem; }
  .panel-header p { margin: 0; color: var(--text-secondary); }
  .header-actions { display: flex; align-items: center; gap: 1rem; }
  .action-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .close-btn {
    border: none;
    padding: 0.5rem;
  }
  .close-btn:hover { background-color: var(--bg-hover); }

  .panel-content {
    flex-grow: 1;
    overflow: hidden;
    position: relative;
  }

  .bpmn-container {
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
  }
  .diagram { flex: 3; }
  .properties {
    flex: 1;
    border-left: 1px solid #ccc;
    background: #f9f9f9;
    overflow-y: auto;
  }

  .loading-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    color: var(--text-primary);
  }
  :global(body.dark) .loading-overlay {
    background-color: rgba(31, 41, 55, 0.8);
  }
  .loading-overlay span {
    margin-top: 1rem;
    font-weight: 500;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
    color: var(--accent-color);
  }

  :global(.djs-visual > rects) {
    fill: #e0e7ff !important;
    stroke: var(--accent-color) !important;
    stroke-width: 2px !important;
  }
  :global( .djs-visual > path) {
    stroke: var(--text-secondary) !important;
    stroke-width: 0.1rem !important;
  }
  :global(.djs-label) {
    font-family: 'Inter', sans-serif !important;
    fill: var(--text-primary) !important;
    font-weight: 600 !important;
  }
  :global(.djs-element.djs-shape[data-element-id^="StartEvent_"] > .djs-visual > circle) {
    fill: #e6fffa !important;
    stroke: var(--success-color) !important;
    stroke-width: 2.5px !important;
  }
  :global(.djs-visual > circle) {
    fill: #fff5f5 !important;
    stroke: #c53030 !important;
    stroke-width: 3px !important;
  }
  :global(.djs-visual > rect) {
    fill: var(--bg-primary) !important;
    stroke: var(--text-secondary) !important;
    stroke-width: 2px !important;
  }
  :global(.djs-visual > polygon) {
    fill: #fffbeb !important;
    stroke: #d69e2e !important;
    stroke-width: 2.5px !important;
  }
  :global(.djs-connection-outline, .djs-outline) {
    stroke: transparent !important;
  }
  :global(.djs-hit) {
    stroke: none !important;
    fill: transparent !important;
  }
</style>
