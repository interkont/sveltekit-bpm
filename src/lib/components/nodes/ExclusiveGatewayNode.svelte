<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
  export let selected = false;
</script>

<div class="gateway-node-wrapper">
  <!-- The label is now outside the node itself -->
  <div class="label">{data.label}</div>
  
  <div class="gateway-node" class:selected={selected}>
    <Handle type="target" position={Position.Left} />
    
    <div class="diamond">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>

    <Handle type="source" position={Position.Right} id="yes" />
    <Handle type="source" position={Position.Bottom} id="no" />
  </div>
</div>

<style>
  .gateway-node-wrapper {
    position: relative;
    width: 60px;
    height: 60px;
  }

  .label {
    position: absolute;
    top: -22px; /* Position it above the node */
    width: 150px; /* Give it enough space */
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none; /* Make sure it doesn't interfere with mouse events */
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
    background-color: var(--c-background-exg);
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
  :global(.gateway-node .svelte-flow__handle-bottom) { bottom: -2px; }
  :global(.gateway-node .svelte-flow__handle) {
    width: 10px;
    height: 10px;
    background-color: #a1a1aa;
  }
  :root {--c-background-exg: #fefce8;}
  :root.dark {--c-background-exg: #2a2a2a;}
</style>
