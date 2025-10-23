<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    useSvelteFlow,
    type Node,
    type Edge,
    type NodeTypes,
    type EdgeTypes,
    type NodeMouseEvent,
    MarkerType,
    type Connection,
    addEdge,
    type EdgeMouseEvent,
    type OnBeforeDelete,
    getConnectedEdges,
  } from '@xyflow/svelte';
  import { setContext, onMount } from 'svelte';
  import { writable, get } from 'svelte/store';
  import '@xyflow/svelte/dist/style.css';
  import Icon from '$lib/components/Icon.svelte';
  import { _ } from 'svelte-i18n';

  import { processDefinitionService } from '$lib/services/processDefinitionService';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import type { ProcessDefinitionData, ProcessDefinitionPayload } from '$lib/types';
  import { transformFlowToAPI } from '$lib/utils/process-transformer';
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
  import ReconnectEdge from '$lib/components/edges/ReconnectEdge.svelte';

  export let processId: number | null = null;

  let mode = writable<'create' | 'view' | 'edit'>('create');
  let isLoading = writable(true);
  let isSaving = writable(false);
  let isProcessPropertiesValid = writable(false);
  let bpmnProcessId: string | undefined = undefined;

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

  const { screenToFlowPosition, fitView, deleteElements, getViewport, setViewport } = useSvelteFlow();
  
  let isBrowser = false;

  const initialNodes: Node[] = processId ? [] : [ { id: `startEvent_${Date.now()}`, type: 'startEvent', data: { label: 'Start', assignedRoleId: null }, position: { x: 50, y: 150 } } ];
  const nodes = writable(initialNodes);
  const edges = writable<Edge[]>([]);

  onMount(async () => {
    isBrowser = true;
    processRoleStore.fetchRoles();

    if (processId) {
      mode.set('view');
      isLoading.set(true);
      try {
        const data = await processDefinitionService.getProcessById(processId);
        processDefinition.set({
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status,
            businessProcessKey: data.businessProcessKey
        });
        bpmnProcessId = data.bpmnProcessId;

        if (data.diagramJson) {
            const { nodes: loadedNodes, edges: loadedEdges, viewport } = data.diagramJson;
            nodes.set(loadedNodes || []);
            // Asegurarnos que las flechas cargadas tambien sean reconectables
            const reconnectableEdges = (loadedEdges || []).map(edge => ({ ...edge, type: 'reconnect' }));
            edges.set(reconnectableEdges);
            if(viewport) setTimeout(() => setViewport(viewport), 50);
        } else {
            nodes.set([ { id: `startEvent_${Date.now()}`, type: 'startEvent', data: { label: 'Start' }, position: { x: 50, y: 150 } } ]);
            edges.set([]);
        }

      } catch (error) {
        toast.show('Error cargando la definicion del proceso.', 'error');
        console.error("Error fetching process definition:", error);
      } finally {
        isLoading.set(false);
        setTimeout(() => fitView(), 100);
      }
    } else {
      mode.set('create');
      isLoading.set(false);
      setTimeout(() => fitView(), 10);
    }
  });

  const nodeTypes: NodeTypes = {
    startEvent: StartEventNode,
    endEvent: EndEventNode,
    userTask: UserTaskNode,
    exclusiveGateway: ExclusiveGatewayNode,
    autoTask: AutoTaskNode,
    parallelGateway: ParallelGatewayNode
  };

  const edgeTypes: EdgeTypes = {
    reconnect: ReconnectEdge
  };

  const executeSave = async () => {
    isSaving.set(true);
    const currentNodes = get(nodes);
    const currentEdges = get(edges);
    const { elements, sequences } = transformFlowToAPI(currentNodes, currentEdges);
    const processData = get(processDefinition);
    const payload: ProcessDefinitionPayload = {
      ...processData,
      diagramJson: { nodes: currentNodes, edges: currentEdges, viewport: getViewport() },
      elements,
      sequences,
    };
    if (processId && bpmnProcessId) {
      payload.bpmnProcessId = bpmnProcessId;
    } else {
      payload.bpmnProcessId = processData.businessProcessKey;
    }

    try {
      if (processId) {
        const updatedProcess = await processDefinitionService.updateProcess(processId, payload);
        toast.show(`Proceso '${updatedProcess.name}' actualizado con éxito!`);
        window.location.hash = `process-model-detail/${updatedProcess.id}`;
        mode.set('view');
      } else {
        const newProcess = await processDefinitionService.createProcess(payload);
        toast.show(`Proceso '${newProcess.name}' creado con éxito!`);
        window.history.pushState(null, '', `/#process-model-detail/${newProcess.id}`);
        processId = newProcess.id;
        bpmnProcessId = newProcess.bpmnProcessId;
        mode.set('view');
      }
    } catch (error) {
        // Error is already shown by global handler
    } finally {
        isSaving.set(false);
    }
  };
  
  async function handleSave() {
    isSaving.set(true);
    let message: string;

    if (processId) {
        try {
            const saveAction = await processDefinitionService.getSaveAction(processId);
            if (saveAction.action === 'CREATE_NEW_VERSION') {
                message = $_('editor.save_confirm_new_version', { values: { state: saveAction.state, instancesCount: saveAction.instancesCount } });
            } else {
                message = $_('editor.save_confirm_update');
            }
        } catch (error) {
            isSaving.set(false);
            return;
        }
    } else {
        message = $_('editor.save_confirm_new');
    }
    
    isSaving.set(false);
    modal.show({
      title: $_('editor.save_confirm_title'),
      message,
      onConfirm: executeSave,
    });
  }

  async function handleDelete() {
    if (!processId) return;

    modal.show({
      title: $_('editor.delete_confirm_title'),
      message: $_('editor.delete_confirm_message', { values: { name: get(processDefinition).name } }),
      onConfirm: async () => {
        isSaving.set(true);
        try {
          await processDefinitionService.deleteProcess(processId!);
          toast.show($_('editor.delete_success'));
          window.location.hash = 'process-models';
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast.show(`${$_('editor.delete_error')}: ${errorMessage}`, 'error');
        } finally {
          isSaving.set(false);
        }
      }
    });
  }

  async function handleSaveMetadata() {
    if (!processId) return;

    modal.show({
        title: $_('editor.update_metadata_confirm_title'),
        message: $_('editor.update_metadata_confirm_message'),
        onConfirm: async () => {
            isSaving.set(true);
            try {
                const metadata = get(processDefinition);
                await processDefinitionService.patchProcessMetadata(processId!, metadata);
                toast.show($_('editor.update_metadata_success'));
            } catch (error) {
                // The global API service already shows a toast on error
            } finally {
                isSaving.set(false);
            }
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
      data: { condition: '' },
      type: 'reconnect' // Asignamos el tipo a las nuevas flechas
    };
    const sourceNode = get(nodes).find(n => n.id === connection.source);
    if (sourceNode?.type === 'exclusiveGateway') { newEdge.class = 'requires-condition'; }
    edges.update((eds) => addEdge(newEdge, eds));
  }
  
  function handleEdgeUpdate(event: CustomEvent<{ edge: Edge; connection: Connection }>) {
    const { edge, connection } = event.detail;
    edges.update((eds) =>
      eds.map((e) => {
        if (e.id === edge.id) {
          return { ...e, source: connection.source, target: connection.target };
        }
        return e;
      })
    );
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

  function handleValidation(event: CustomEvent<{ isValid: boolean }>) {
    isProcessPropertiesValid.set(event.detail.isValid);
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
    const newNodeId = `${type}_${Date.now()}`;

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

    const newNode: Node = { id: newNodeId, type, position, data };
    nodes.update((n) => [...n, newNode]);
    dndType.set(null);
  }

  const onBeforeDelete: OnBeforeDelete = ({ nodes: nodesToRemove, edges: edgesToRemove }) => {
    
    const currentNodes = get(nodes);
    const currentEdges = get(edges);

    const connectedEdges = getConnectedEdges(nodesToRemove, currentEdges);

    const nodesToUpdate = currentNodes.filter((node) => !nodesToRemove.some((n) => n.id === node.id));
    const edgesToUpdate = currentEdges.filter(
      (edge) =>
        !edgesToRemove.some((e) => e.id === edge.id) && !connectedEdges.some((ce) => ce.id === edge.id)
    );
    nodes.set(nodesToUpdate);
    edges.set(edgesToUpdate);
    return false;
  };
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="page-container">
  <header class="action-bar view-header">
    <div class="title-cluster">
      <a href="/#process-models" class="back-link" title={$_('editor.back_to_list')}>
        <Icon name="chevron-left" />
      </a>
      <div class="header-content">
        <h1 class="header-title">
            {#if $mode === 'create'}
              {$_('editor.new_process_model_title')}
            {:else if $mode === 'view'}
              {$_('editor.viewing_title')}: {$processDefinition.name}
            {:else}
              {$_('editor.editing_title')}: {$processDefinition.name}
            {/if}
        </h1>
      </div>
    </div>
    <div class="action-buttons">
        {#if $mode === 'view' && processId}
            <button class="edit-btn" on:click={() => mode.set('edit')}>{$_('editor.edit_button')}</button>
        {/if}
        {#if $mode === 'edit' || $mode === 'create'}
            {#if processId}
              <button class="delete-btn" on:click={handleDelete} disabled={$isSaving}>{$_('editor.delete_button')}</button>
            {/if}
            <button class="save-btn" on:click={handleSave} disabled={$isSaving || !$isProcessPropertiesValid}>
                {$isSaving ? $_('editor.saving_button') : $_('editor.save_changes_button')}
            </button>
        {/if}
    </div>
  </header>

  {#if $mode !== 'view'}
    <Sidebar />
  {/if}

  <main class="canvas-container" class:full-width={$mode === 'view'}>
    {#if $isLoading}
        <div class="ssr-placeholder">{$_('editor.loading_model')}</div>
    {:else if isBrowser}
      <SvelteFlow 
        bind:nodes={$nodes} 
        edges={$edges}
        {nodeTypes} 
        {edgeTypes}
        on:edgeupdate={handleEdgeUpdate}
        onbeforedelete={onBeforeDelete}
        ondragover={onDragOver}
        ondrop={onDrop}
        onnodeclick={onNodeClick}
        onedgeclick={onEdgeClick}
        onpaneclick={onPaneClick}
        onconnect={onConnect}
        onselectionchange={onSelectionChange}
        colorMode={$theme}
        nodesDraggable={$mode !== 'view'}
        nodesConnectable={$mode !== 'view'}
        elementsSelectable={$mode !== 'view'}
        fitView
      >
        <Background />
        <Controls />
      </SvelteFlow>
    {:else}
      <div class="ssr-placeholder">{$_('editor.loading_editor')}</div>
    {/if}
  </main>

  <aside class="properties-panel">
    {#if $selectedNode}
      <h3 class="panel-title">{$_('editor.node_properties_title')}</h3>
      {#if $selectedNode.type === 'userTask' || $selectedNode.type === 'startEvent'}
        <TaskPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} disabled={$mode === 'view'} />
      {:else if $selectedNode.type === 'autoTask'}
        <AutoTaskPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} disabled={$mode === 'view'} />
      {:else if $selectedNode.type === 'exclusiveGateway' || $selectedNode.type === 'parallelGateway'}
        <BasicPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} disabled={$mode === 'view'} />
      {:else if $selectedNode.type === 'endEvent'}
        <BasicPropertiesPanel node={$selectedNode} on:update={handleUpdateNode} disabled={$mode === 'view'} />
      {:else}
        <p>{$_('editor.no_properties')}</p>
      {/if}
    {:else if $selectedEdge}
      <h3 class="panel-title">{$_('editor.sequence_properties_title')}</h3>
      <EdgePropertiesPanel edge={$selectedEdge} nodes={$nodes} on:update={handleUpdateEdge} disabled={$mode === 'view'} />
    {:else}
      <h3 class="panel-title">{$_('editor.process_properties_title')}</h3>
      <ProcessPropertiesPanel 
        processData={$processDefinition}
        isNewProcess={!processId}
        on:update={handleProcessUpdate}
        on:saveMetadata={handleSaveMetadata}
        on:validation={handleValidation}
        disabled={$mode === 'view'} 
      />
    {/if}
  </aside>
</div>

<style>
  .page-container {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 240px 1fr 320px;
    height: 100%;
    overflow: hidden;
  }
  .canvas-container.full-width {
    grid-column: 1 / span 2;
  }

  .action-bar {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .title-cluster {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .back-link {
    color: var(--text-primary);
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  .back-link:hover {
    background-color: var(--bg-hover);
  }

  .action-buttons { display: flex; gap: 0.75rem; }

  .action-bar h1 { font-size: 1.5rem; font-weight: 600; margin: 0; }
  .save-btn {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .save-btn:hover { opacity: 0.9; }
  .save-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

  .edit-btn {
    background-color: #4f46e5;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .edit-btn:hover { background-color: #4338ca; }

  .delete-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.9rem 0.9rem; font-weight: 600; display: inline-flex; align-items: center; transition: color 0.2s; border-radius: 8px; }
  .delete-btn:hover { color: #e53e3e; background-color: rgba(229, 62, 62, 0.1); }
  .delete-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

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
