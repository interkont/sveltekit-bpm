<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // --- AJUSTE CLAVE: Importar CSS desde la carpeta local 'vendor' ---
  // Estos estilos se han descargado localmente para evitar problemas con las rutas
  // de los paquetes de node_modules y garantizar la consistencia.
  import '$lib/vendor/bpmn-styles/diagram-js.css';
  import '$lib/vendor/bpmn-styles/bpmn-embedded.css';
  import '$lib/vendor/bpmn-styles/bpmn-js-properties-panel.css';

  const dispatch = createEventDispatcher<{
    save: { xml: string };
    cancel: void;
    error: { error: unknown };
  }>();

  let container: HTMLElement;
  let propertiesContainer: HTMLElement;
  let modeler: any;

  onMount(async () => {
    // Asegurarse de que el código solo se ejecute en el navegador.
    // Las librerías de BPMN no son compatibles con el renderizado en servidor (SSR).
    if (browser) {
      try {
        // Importación dinámica LOCAL de las librerías de JavaScript.
        // Esto es crucial para que Vite/SvelteKit no intenten cargarlas en el servidor.
        const ModelerModule = (await import('bpmn-js/lib/Modeler')).default;
        const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = await import('bpmn-js-properties-panel');

        modeler = new ModelerModule({
          container,
          propertiesPanel: { parent: propertiesContainer },
          additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule
          ],
          keyboard: { bindTo: document }
        });

        // Diagrama XML de ejemplo para iniciar el modelador con un lienzo en blanco.
        const diagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="150" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

        await modeler.importXML(diagramXML);
        modeler.get('canvas').zoom('fit-viewport');

      } catch (err) {
        console.error("Error al inicializar el modelador:", err);
        dispatch('error', { error: err });
      }
    }
  });

  async function saveDiagram() {
    if (!modeler) return;
    try {
      const { xml } = await modeler.saveXML({ format: true });
      dispatch('save', { xml });
    } catch (err) {
      dispatch('error', { error: err });
    }
  }

  function cancel() {
    dispatch('cancel');
  }

  onDestroy(() => {
    // Destruir la instancia del modelador para liberar recursos.
    if (modeler) {
      try { modeler.destroy(); } catch (_) {}
    }
  });
</script>

<div class="toolbar">
  <button class="save-btn" on:click={saveDiagram}>💾 Guardar</button>
  <button class="cancel-btn" on:click={cancel}>✖ Cancelar</button>
</div>

<div class="bpmn-container">
  <div bind:this={container} class="diagram"></div>
  <div bind:this={propertiesContainer} class="properties"></div>
</div>

<style>
  .toolbar { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.5rem 0; }
  .save-btn, .cancel-btn { padding: 0.5rem 0.9rem; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer; font-weight: 600; }
  .save-btn { background: var(--accent-color); color: white; border-color: rgba(0,0,0,0.05); }
  .cancel-btn { background: #fff; color: #333; }
  .bpmn-container { display: flex; width: 100%; height: 800px; border: 1px solid #ccc; }
  .diagram { flex: 3; background: #fff; }
  .properties { flex: 1; border-left: 1px solid #ccc; background: #f9f9f9; overflow-y: auto; }
</style>