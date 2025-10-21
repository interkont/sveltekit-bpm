<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Edge, Node } from '@xyflow/svelte';

  export let edge: Edge;
  export let nodes: Node[];
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  let condition = edge.data?.condition || '';

  // Reactive property to check if the edge comes from an exclusive gateway
  $: isFromExclusiveGateway = nodes.find(n => n.id === edge.source)?.type === 'exclusiveGateway';

  function handleUpdate() {
    dispatch('update', {
      condition
    });
  }

  $: if (edge.id) {
    condition = edge.data?.condition || '';
  }
</script>

<div class="properties-panel-content">
  <div class="form-group">
    <label for="edge-id">Element ID</label>
    <input 
      id="edge-id"
      type="text" 
      readonly
      value={edge.id}
      class="readonly-input"
    />
  </div>

  {#if isFromExclusiveGateway}
    <div class="form-group">
      <label for="edge-condition">Condition Expression</label>
      <input 
        id="edge-condition"
        type="text" 
        bind:value={condition}
        on:blur={handleUpdate}
        placeholder={'e.g., ${amount > 1000}'}
        {disabled}
      />
      <small>This condition is evaluated if the flow comes from a gateway.</small>
    </div>
  {/if}
</div>

<style>
  .properties-panel-content, .form-group {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  label {
    font-weight: 500;
    margin-bottom: 0.375rem;
    font-size: 14px;
  }
  input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }
  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .readonly-input { cursor: not-allowed; color: var(--text-secondary); }
  input:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  small {
    margin-top: 0.375rem;
    font-size: 12px;
    color: #6b7280;
  }
  input,textarea,select {background-color: var(--bg-secondary);}
</style>
