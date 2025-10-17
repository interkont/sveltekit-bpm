<script lang="ts">
  import { SvelteFlow, Controls, Background, useSvelteFlow, type Node } from '@xyflow/svelte';
  import { setContext, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import '@xyflow/svelte/dist/style.css';

  import StartEventNode from '$lib/components/nodes/StartEventNode.svelte';
  import EndEventNode from '$lib/components/nodes/EndEventNode.svelte';
  import UserTaskNode from '$lib/components/nodes/UserTaskNode.svelte';
  import GatewayNode from '$lib/components/nodes/GatewayNode.svelte';
  import Sidebar from '$lib/components/layout/PaletteSidebar.svelte';

  // --- Drag-and-Drop Context ---
  const dndType = writable<string | null>(null);
  setContext('dnd-context', dndType);

  // --- Svelte Flow Setup ---
  let isBrowser = false;
  onMount(() => {
    isBrowser = true;
  });

  // --- CORRECTION: We only need screenToFlowPosition from the hook, not addNodes ---
  const { screenToFlowPosition } = useSvelteFlow();

  const nodeTypes = {
    startEvent: StartEventNode,
    endEvent: EndEventNode,
    userTask: UserTaskNode,
    gateway: GatewayNode
  };
  
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'startEvent',
      data: { label: 'Start' },
      position: { x: 50, y: 150 }
    }
  ];

  const nodes = writable(initialNodes);
  const edges = writable([]);

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    
    const type = $dndType;
    if (!type) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    let data: { label: string; assignedRoleId?: number | null; assignedRoleName?: string } = {
        label: `New ${type.replace(/([A-Z])/g, ' $1').trim()}`
    };

    if (type === 'userTask') {
        data = {
            label: 'New User Task',
            assignedRoleId: null,
            assignedRoleName: undefined
        };
    }

    const newNode: Node = {
      id: `dnd-${Date.now()}`,
      type,
      position,
      data,
    };
    
    // --- CORRECTION: We update the nodes store directly, as shown in the official example ---
    nodes.update((n) => [...n, newNode]);
    dndType.set(null);
  }
</script>

<div class="page-container">
  <Sidebar />

  <main class="canvas-container">
    {#if isBrowser}
      <SvelteFlow 
        nodes={$nodes} 
        edges={$edges} 
        {nodeTypes} 
        fitView
        ondragover={onDragOver}
        ondrop={onDrop}
      >
        <Background />
        <Controls />
      </SvelteFlow>
    {:else}
      <div class="ssr-placeholder">Loading Modeler...</div>
    {/if}
  </main>

  <aside class="properties-panel">
    <h3 class="panel-title">Properties</h3>
    <div class="no-selection">
      <p>Select an element to see its properties.</p>
    </div>
  </aside>
</div>

<style>
  .page-container {
    display: grid;
    grid-template-columns: 240px 1fr 320px;
    height: 100vh;
    overflow: hidden;
  }

  .properties-panel {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-left: none;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .panel-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #111827;
  }

  .canvas-container {
    background-color: #f9fafb;
    overflow: hidden;
    position: relative;
  }

  .no-selection {
    text-align: center;
    color: #6b7280;
    margin-top: 2rem;
  }
  
  .ssr-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
