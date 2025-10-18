<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  // --- FIX: Import our custom AppNode type ---
  import type { Node } from '@xyflow/svelte';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  
  // --- FIX: Use the specific AppNode type for the node prop ---
  export let node: Node;

  const dispatch = createEventDispatcher();

  let label = node.data.label || '';
  let description = node.data.description || '';
  // The type error is now gone because TypeScript knows 'assignedRoleId' exists and is a number or null.
  let assignedRoleId: number | null | '' = node.data.assignedRoleId ?? null;

  function handleUpdate() {
    const finalRoleId = assignedRoleId === '' ? null : Number(assignedRoleId);
    const selectedRole = $processRoleStore.roles.find(r => r.id === finalRoleId);
    
    dispatch('update', {
      label,
      description,
      assignedRoleId: finalRoleId,
      assignedRoleName: selectedRole?.name || ''
    });
  }

  let currentNodeId = node.id;

  $: if (node.id !== currentNodeId) {
    label = node.data.label || '';
    description = node.data.description || '';
    assignedRoleId = node.data.assignedRoleId ?? null;
    currentNodeId = node.id;
  }
</script>

<div class="properties-panel-content">
  <!-- Basic Properties -->
  <div class="form-group">
    <label for="node-id">Element ID</label>
    <input 
      id="node-id"
      type="text" 
      readonly
      value={node.id}
      class="readonly-input"
    />
  </div>

  <div class="form-group">
    <label for="task-label">Node Label</label>
    <input 
      id="task-label"
      type="text" 
      bind:value={label}
      on:blur={handleUpdate}
    />
  </div>

  <div class="form-group">
    <label for="node-description">Description</label>
    <textarea 
      id="node-description"
      bind:value={description}
      on:blur={handleUpdate}
      rows="4"
      placeholder="Add an optional description..."
    />
  </div>

  <hr class="divider" />

  <!-- Task-Specific Properties -->
  <div class="form-group">
    <label for="assigned-role">
      Assigned Role
      {#if node.type === 'startEvent'}(Optional){/if}
    </label>
    
    {#if $processRoleStore.loading}
      <div class="loading-placeholder">Loading roles...</div>
    {:else}
      <select 
        id="assigned-role"
        bind:value={assignedRoleId}
        on:change={handleUpdate}
        class:error={node.type === 'userTask' && !assignedRoleId}
      >
        <option value="">-- Select a role --</option>
        {#each $processRoleStore.roles as role (role.id)}
          <option value={role.id}>{role.name}</option>
        {/each}
      </select>
    {/if}

    {#if node.type === 'userTask' && !assignedRoleId}
      <span class="error-message">A role must be assigned.</span>
    {/if}
  </div>
</div>

<style>
  .properties-panel-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
  }
  label {
    font-weight: 500;
    margin-bottom: 0.375rem;
    font-size: 14px;
  }
  input[type="text"],
  textarea,
  select {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input[type="text"]:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .readonly-input { cursor: not-allowed; color: var(--text-secondary); }
  .divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0.5rem 0;
  }
  select.error {
    border-color: #ef4444;
  }
  .error-message {
    font-size: 12px;
    color: #ef4444;
    margin-top: 0.25rem;
  }
  .loading-placeholder {
    padding: 0.6rem 0.75rem;
    background-color: #f3f4f6;
    border-radius: 6px;
    color: #6b7280;
    font-style: italic;
  }
  input,textarea,select {background-color: var(--bg-secondary);}
</style>
