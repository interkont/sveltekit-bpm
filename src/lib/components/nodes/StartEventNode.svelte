<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
</script>

<!-- --- REFACTOR: Add a wrapper to contain the node and the optional badge --- -->
<div class="node-wrapper">
  <div class="start-event-node">
    <Handle type="source" position={Position.Right} />
    <div class="label">{data.label}</div>
  </div>

  <!-- --- NEW: Conditionally render the role badge if it exists --- -->
  {#if data.assignedRoleName}
    <div class="node-role">{data.assignedRoleName}</div>
  {/if}
</div>


<style>
  .node-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px; /* Space between the node circle and the badge */
  }

  .start-event-node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: var(--c-background-ste);
    border: 3px solid #4ade80; /* Green */
    border-radius: 50%;
    font-size: 12px;
    text-align: center;
    position: relative; /* Needed for handle positioning */
  }

  /* --- NEW: Style for the role badge, consistent with UserTaskNode --- */
  .node-role {
    font-size: 11px;
    background-color: #e5e7eb;
    padding: 2px 8px;
    border-radius: 10px;
    color: #4b5563;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :root {--c-background-ste: white;}
  :root.dark {--c-background-ste: #2a2a2a;}
</style>
