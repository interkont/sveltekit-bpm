<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
  export let selected = false;
</script>

<div class="gateway-node" class:selected={selected}>
  <Handle type="target" position={Position.Left} />
  <div class="diamond">
    <div class="inner-text">{data.label || '?'}</div>
  </div>
  <Handle type="source" position={Position.Right} />
  <Handle type="source" position={Position.Bottom} />
</div>

<style>
  .gateway-node {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .diamond {
    width: 55px;
    height: 55px;
    background-color: white;
    border: 2px solid #facc15; /* Amber */
    transform: rotate(45deg);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
  }

  .gateway-node.selected .diamond {
    border-color: #eab308; /* Yellow */
    box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2);
  }

  .inner-text {
    transform: rotate(-45deg);
    font-size: 12px;
    font-weight: 500;
    max-width: 90%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Position handles relative to the parent container */
  :global(.gateway-node .svelte-flow__handle) {
    width: 8px;
    height: 8px;
  }
</style>
