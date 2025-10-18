<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { SvelteFlow, Background } from '@xyflow/svelte';
  import type { Node, Edge } from '@xyflow/svelte'; // Import Node and Edge types

  import '@xyflow/svelte/dist/style.css';

  import { processModelDetailStore } from '$lib/stores/processModelDetailStore';
  import Icon from '$lib/components/Icon.svelte';
  import type { ProcessModel } from '$lib/types';

  import StartEventNode from './nodes/StartEventNode.svelte';
  import EndEventNode from './nodes/EndEventNode.svelte';
  import UserTaskNode from './nodes/UserTaskNode.svelte';
  import ExclusiveGatewayNode from './nodes/ExclusiveGatewayNode.svelte';

  export let model: ProcessModel;

  // --- CLIENT-SIDE GUARD ---
  let isBrowser = false;
  onMount(() => {
    isBrowser = true;
  });

  const nodeTypes = {
    startEvent: StartEventNode,
    endEvent: EndEventNode,
    userTask: UserTaskNode,
    exclusiveGateway: ExclusiveGatewayNode
  };

  // --- FIX: Explicitly type the Svelte Flow stores ---
  const nodes = writable<Node[]>([]);
  const edges = writable<Edge[]>([]);

  $: if (model) {
    try {
      if (model.flowJson) {
        const flowData = JSON.parse(model.flowJson);
        nodes.set(flowData.nodes || []);
        edges.set(flowData.edges || []);
      } else {
        nodes.set([]);
        edges.set([]);
      }
    } catch (e) {
      console.error('Failed to parse flowJson:', e);
      nodes.set([]);
      edges.set([]);
    }
  }
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
>
  <header class="panel-header">
    <div>
      <span class="header-subtitle">Modelo de Proceso</span>
      <h2 title={model?.name}>{model?.name}</h2>
      <p>ID: {model?.id} | Versión: {model?.version}</p>
    </div>
    <div class="header-actions">
      <button class="action-btn" on:click={() => (window.location.hash = 'process-models')}>
        <Icon name="edit" size={18}/> Editar
      </button>
      <button class="action-btn close-btn" on:click={processModelDetailStore.hide} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </div>
  </header>

  <div class="panel-content">
    <div class="flow-container">
      {#if isBrowser}
        <SvelteFlow
          nodes={$nodes}
          edges={$edges}
          {nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnDrag={true}
        >
          <Background />
        </SvelteFlow>
      {:else}
        <div class="ssr-placeholder">Loading Diagram...</div>
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
    width: 70vw;
    max-width: 1200px;
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
    background-color: #f8f9fa;
  }
  
  .flow-container {
    width: 100%;
    height: 100%;
  }

  .ssr-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #9ca3af;
    font-style: italic;
  }
</style>
