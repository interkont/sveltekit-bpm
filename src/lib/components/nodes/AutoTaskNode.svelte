<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
  export let selected = false;
</script>

<div class="auto-task-node" class:selected={selected}>
  <Handle type="target" position={Position.Left} />
  
  <div class="node-content">
    <div class="node-icon">
      <!-- Gear Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20v-4"/><path d="M12 8V4"/><path d="m20 12-4 0"/><path d="M8 12H4"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="m19.07 4.93-1.41 1.41"/><path d="m6.34 17.66-1.41 1.41"/>
        <path d="m17.66 6.34-1.41-1.41"/><path d="m4.93 19.07-1.41-1.41"/>
      </svg>
    </div>
    <div class="node-label">{data.label || 'Auto Task'}</div>
    {#if data.webhook}
      <div class="node-webhook" title={data.webhook}>Webhook Set</div>
    {/if}
  </div>

  <Handle type="source" position={Position.Right} />
</div>

<style>
  .auto-task-node {
    padding: 10px 15px;
    border-radius: 8px;
    background: var(--c-background-at);
    border: 2px solid #a78bfa; /* Violet */
    min-width: 150px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
  }

  .auto-task-node.selected {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .node-icon { color: #7c3aed; }
  .node-label { font-weight: 500; }
  .node-webhook {
    font-size: 11px;
    background-color: #ede9fe;
    padding: 2px 8px;
    border-radius: 10px;
    color: #5b21b6;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :root {--c-background-at: white;}
  :root.dark {--c-background-at: #2a2a2a;}
</style>
