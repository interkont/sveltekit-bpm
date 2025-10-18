<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
  export let selected = false;
</script>

<!-- --- REFACTOR: Add a wrapper for positioning the label --- -->
<div class="gateway-node-wrapper">
  <!-- The label is now outside the node itself, positioned above -->
  <div class="label">{data.label}</div>

  <div class="gateway-node" class:selected={selected}>
    <Handle type="target" position={Position.Left} />
    
    <div class="diamond">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>

    <Handle type="source" position={Position.Right} />
  </div>
</div>

<style>
  /* --- REFACTOR: Copied styles from ExclusiveGatewayNode for consistency --- */
  .gateway-node-wrapper {
    position: relative;
    width: 60px;
    height: 60px;
  }

  .label {
    position: absolute;
    top: -22px;
    width: 150px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
  }

  .gateway-node {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .diamond {
    width: 45px;
    height: 45px;
    background-color: var(--c-background-pg);
    border: 2px solid #facc15;
    transform: rotate(45deg);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    color: #a16207;
  }

  .gateway-node.selected .diamond {
    border-color: #eab308;
    box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2);
  }

  .diamond svg {
    transform: rotate(-45deg);
  }

  :global(.gateway-node .svelte-flow__handle-left) { left: -2px; }
  :global(.gateway-node .svelte-flow__handle-right) { right: -2px; }
  :global(.gateway-node .svelte-flow__handle) {
    width: 10px;
    height: 10px;
    background-color: #a1a1aa;
  }
  :root {--c-background-pg: #fefce8;}
  :root.dark {--c-background-pg: #2a2a2a;}
</style>
