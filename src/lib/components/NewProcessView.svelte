<script lang="ts">
  import { SvelteFlow, Controls, Background, useSvelteFlow, type Node, type Edge, type NodeTypes, type NodeMouseEvent, MarkerType, type Connection, addEdge, type EdgeMouseEvent } from '@xyflow/svelte';
  import { setContext, onMount } from 'svelte';
  import { writable, get } from 'svelte/store';
  import '@xyflow/svelte/dist/style.css';

  import { processRoleStore } from '$lib/stores/processRoleStore';
  import type { ProcessDefinitionData } from '$lib/types';
  // --- ADD: Import modal and toast stores ---
  import { modal } from '$lib/stores/modal';
  import { toast } from '$lib/stores/toast';
  import { theme } from '$lib/stores/theme';

  import StartEventNode from '$lib/components/nodes/StartEventNode.svelte';
  import EndEventNode from '$lib/components/nodes/EndEventNode.svelte';
  import UserTaskNode from '$lib/components/nodes/UserTaskNode.svelte';
  import ExclusiveGatewayNode from '$lib/components/nodes/ExclusiveGatewayNode.svelte';
  import AutoTaskNode from '$lib/components/nodes/AutoTaskNode.svelte';
  import ParallelGatewayNode from '$lib/components/nodes/ParallelGatewayNode.svelte';
  import Sidebar from '$lib/components/layout/PaletteSidebar.svelte';

  import ProcessPropertiesPanel from '$lib/components/properties/ProcessPropertiesPanel.svelte';
  import TaskPropertiesPanel from '$lib/components/properties/TaskPropertiesPanel.svelte';
  import GatewayPropertiesPanel from '$lib/components/properties/GatewayPropertiesPanel.svelte';
  import BasicPropertiesPanel from '$lib/components/properties/BasicPropertiesPanel.svelte';
  import EdgePropertiesPanel from '$lib/components/properties/EdgePropertiesPanel.svelte';
  import AutoTaskPropertiesPanel from '$lib/components/properties/AutoTaskPropertiesPanel.svelte';

  const processDefinition = writable<ProcessDefinitionData>({
    name: 'New Process Model',
    description: 'A new process created from the modeler.',
    category: null,
    status: 'DRAFT',
    businessProcessKey: ''
  });

  let selectedNode = writable<Node | null>(null);
  let selectedEdge = writable<Edge | null>(null);
  let selectedElements = { nodes: [] as Node[], edges: [] as Edge[] };

  const dndType = writable<string | null>(null);
  setContext('dnd-context', dndType);

  const { screenToFlowPosition, fitView, deleteElements } = useSvelteFlow();
  
  let isBrowser = false;
  onMount(() => {
    isBrowser = true;
    processRoleStore.fetchRoles();
    setTimeout(() => fitView(), 10);
  });

  const nodeTypes: NodeTypes = {
    startEvent: StartEventNode,
    endEvent: EndEventNode,
    userTask: UserTaskNode,
    exclusiveGateway: ExclusiveGatewayNode,
    autoTask: AutoTaskNode,
    parallelGateway: ParallelGatewayNode
  };
  
  const initialNodes: Node[] = [ { id: '1', type: 'startEvent', data: { label: 'Start', assignedRoleId: null }, position: { x: 50, y: 150 } } ];
  const nodes = writable(initialNodes);
  const edges = writable<Edge[]>([]);

  // --- ADD: Save Function ---
  function handleSave() {
    modal.show({
      title: 'Confirmar Guardado',
      message: 'Esta seguro de guardar el modelo del proceso?',
      onConfirm: () => {
        const finalPayload = {
          processDefinition: get(processDefinition),
          nodes: get(nodes),
          edges: get(edges)
        };
        
        console.log('--- Saving Process Model ---');
        console.log(JSON.stringify(finalPayload, null, 2));

        // In a real scenario, this would be an API call.
        toast.show('Modelo de Proceso Guardado con Exito!', 'success');
        
        // Optional: Redirect after save
        // window.location.hash = 'process-models';
      }
    });
  }

  function onNodeClick(event: NodeMouseEvent) { selectedNode.set(event.node); selectedEdge.set(null); }
  function onEdgeClick(event: EdgeMouseEvent) { selectedEdge.set(event.edge); selectedNode.set(null); }
  function onPaneClick() { selectedNode.set(null); selectedEdge.set(null); }

  function onSelectionChange(params: { nodes: any; edges: any; }) {
    selectedElements = params;
    if (params.nodes.length === 1 && params.edges.length === 0) {
      selectedNode.set(params.nodes[0]);
      selectedEdge.set(null);
    } else if (params.edges.length === 1 && params.nodes.length === 0) {
      selectedEdge.set(params.edges[0]);
      selectedNode.set(null);
    } else {
      selectedNode.set(null);
      selectedEdge.set(null);
    }
  }

  function handleKeyDown(event: KeyboardEvent) { if (event.key === 'Delete') { deleteElements(selectedElements); } }
  
  function onConnect(connection: Connection) {
    const newEdge: Edge = {
      id: `edge-${connection.source}-${connection.target}-${Math.random()}`,
      source: connection.source!,
      target: connection.target!,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { condition: '' }
    };
    const sourceNode = get(nodes).find(n => n.id === connection.source);
    if (sourceNode?.type === 'exclusiveGateway') { newEdge.class = 'requires-condition'; }
    edges.update((eds) => addEdge(newEdge, eds));
  }

  function handleUpdateNode(event: CustomEvent<Record<string, any>>) {
    if (!$selectedNode) return;
    const updatedData = event.detail;
    nodes.update(nds => nds.map(n => n.id === $selectedNode?.id ? { ...n, data: { ...n.data, ...updatedData } } : n));
    selectedNode.update(n => n ? { ...n, data: { ...n.data, ...updatedData } } : null);
  }

  function handleUpdateEdge(event: CustomEvent<{ condition?: string }>) {
    if (!$selectedEdge) return;
    const updatedData = event.detail;
    edges.update(eds =>
      eds.map(e => {
        if (e.id === $selectedEdge?.id) {
          const newData = { ...e.data, ...updatedData };
          const newLabel = newData.condition;
          const sourceNode = get(nodes).find(n => n.id === e.source);
          let className = '';
          if (sourceNode?.type === 'exclusiveGateway') { className = newData.condition ? 'conditional-flow' : 'requires-condition'; }
          return { ...e, data: newData, class: className, label: newLabel };
        }
        return e;
      })
    );
    selectedEdge.update(e => e ? { ...e, data: { ...e.data, ...updatedData } } : null);
  }
  
  function handleProcessUpdate(event: CustomEvent<ProcessDefinitionData>) {
    processDefinition.update(pd => ({ ...pd, ...event.detail }));
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) { event.dataTransfer.dropEffect = 'move'; }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    const type = $dndType;
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let data: { label: string; [key: string]: any; } = { label: `New ${type.replace(/([A-Z])/g, ' $1').trim()}` };
    if (type === 'userTask' || type === 'startEvent') {
        data = { ...data, label: type === 'userTask' ? 'New User Task' : 'Start', assignedRoleId: null, assignedRoleName: undefined };
    } else if (type === 'exclusiveGateway') {
        data = { ...data, label: 'Condition?' };
    } else if (type === 'autoTask') {
        data = { ...data, label: 'New Auto Task', webhook: '' };
    } else if (type === 'parallelGateway') {
        data = { ...data, label: 'Parallel' };
    }
    const newNode: Node = { id: `dnd-${Date.now()}`, type, position, data };
    nodes.update((n) => [...n, newNode]);
    dndType.set(null);
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="page-container">
  <!-- --- ADD: Action bar with Save button --- -->
  <header class="action-bar">
    <h1>Modelador de Procesos</h1>
    <button class="save-btn" on:click={handleSave}>Guardar Cambios</button>
  </header>

  <Sidebar />

  <main class="canvas-container">
    {#if isBrowser}
      <SvelteFlow 
        bind:nodes={$nodes} 
        edges={$edges} 
        {nodeTypes} 
        ondragover={onDragOver}
        ondrop={onDrop}
        onnodeclick={onNodeClick}
        onedgeclick={onEdgeClick}
        onpaneclick={onPaneClick}
        onconnect={onConnect}
        onselectionchange={onSelectionChange}
        colorMode={$theme}
      >
        <Background />
        <Controls />
      </SvelteFlow>
    {:else}
      <div class="ssr-placeholder">Loading Modeler...</div>
    {/if}
  </main>

  <aside class="properties-panel">
    {#if $selectedNode}
      <h3 class="panel-title">Node Properties</h3>
      {#if $selectedNode.type === 'userTask' || $selectedNode.type === 'startEvent'}
        <TaskPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} />
      {:else if $selectedNode.type === 'autoTask'}
        <AutoTaskPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} />
      {:else if $selectedNode.type === 'exclusiveGateway' || $selectedNode.type === 'parallelGateway'}
        <BasicPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} />
      {:else if $selectedNode.type === 'endEvent'}
        <BasicPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} />
      {:else}
        <p>This node type has no configurable properties.</p>
      {/if}
    {:else if $selectedEdge}
      <h3 class="panel-title">Sequence Properties</h3>
      <EdgePropertiesPanel edge={$selectedEdge} nodes={$nodes} on:update={handleUpdateEdge} />
    {:else}
      <h3 class="panel-title">Process Properties</h3>
      <ProcessPropertiesPanel processData={$processDefinition} on:update={handleProcessUpdate} />
    {/if}
  </aside>
</div>

<style>
  .page-container {
    display: grid;
    /* --- REFACTOR: Add a row for the action bar --- */
    grid-template-rows: auto 1fr;
    grid-template-columns: 240px 1fr 320px;
    height: 100%;
    overflow: hidden;
  }

  .action-bar {
    grid-column: 1 / -1; /* Span all columns */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .action-bar h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .save-btn {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .save-btn:hover { background-color: #1d4ed8; }

  /* Adjust grid placement for other elements */
  :global(.palette) { grid-row: 2; }
  .canvas-container { grid-row: 2; }
  .properties-panel { grid-row: 2; }

  .properties-panel {
    background-color: var(--bg-primary);
    border-left: 1px solid #e5e7eb;
    padding: 1rem;
    overflow-y: auto;
  }
  .panel-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; }
  .canvas-container { background-color: #f9fafb; position: relative; }
  .ssr-placeholder { display: flex; justify-content: center; align-items: center; height: 100%; }
  :global(.conditional-flow .svelte-flow__edge-path) { stroke: #2563eb; stroke-width: 2.5; }
  :global(.requires-condition .svelte-flow__edge-path) {
    stroke: #ef4444;
    stroke-width: 2.5;
    stroke-dasharray: 6 4;
    animation: dashdraw 0.5s linear infinite;
  }
  @keyframes dashdraw { to { stroke-dashoffset: -20; } }
</style>
