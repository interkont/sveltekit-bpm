<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
</script>

<div class="end-event-node">
  <Handle type="target" position={Position.Left} />
  <div class="label">{data.label}</div>
</div>

<style>
  .end-event-node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: var(--c-background-en);
    border: 3px solid #f87171; /* Red */
    border-radius: 50%;
    font-size: 12px;
    text-align: center;
  }
  :root {--c-background-en: white;}
  :root.dark {--c-background-en: #2a2a2a;}
</style>
