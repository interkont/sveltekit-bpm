<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';

  export let data;
  export let selected = false;

  // A placeholder for validation logic later
  $: hasError = data.assignedRoleId === undefined || data.assignedRoleId === null;
</script>

<div class="user-task-node" class:selected={selected} class:error={hasError}>
  <Handle type="target" position={Position.Left} />
  <div class="node-content">
    <div class="node-icon">📋</div>
    <div class="node-label">{data.label}</div>
    {#if data.assignedRoleName}
      <div class="node-role">{data.assignedRoleName}</div>
    {:else}
      <div class="node-role-placeholder">No role</div>
    {/if}
  </div>
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .user-task-node {
    padding: 10px 15px;
    border-radius: 8px;
    background: white;
    border: 2px solid #60a5fa; /* Blue */
    min-width: 150px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;
  }

  .user-task-node.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .user-task-node.error {
    border-color: #f87171; /* Red */
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .node-icon {
    font-size: 20px;
  }

  .node-label {
    font-weight: 500;
  }

  .node-role,
  .node-role-placeholder {
    font-size: 11px;
    background-color: #e5e7eb;
    padding: 2px 8px;
    border-radius: 10px;
    color: #4b5563;
  }

  .node-role-placeholder {
    background-color: #fee2e2;
    color: #b91c1c;
  }
</style>
