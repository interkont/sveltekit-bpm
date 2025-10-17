<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
</script>

<div class="start-event-node">
  <Handle type="source" position={Position.Right} />
  <div class="label">{data.label}</div>
</div>

<style>
  .start-event-node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: white;
    border: 2px solid #4ade80; /* Green */
    border-radius: 50%;
    font-size: 12px;
    text-align: center;
  }
</style>
