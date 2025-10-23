<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Node } from '@xyflow/svelte';
  import { _ } from 'svelte-i18n';

  export let node: Node;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  let label = node.data.label || '';
  // --- NEW: Add description field ---
  let description = node.data.description || '';

  function handleUpdate() {
    dispatch('update', {
      label,
      description
    });
  }

  // Reactive block to reset form when the selected node changes
  $: if (node.id) {
    label = node.data.label || '';
    description = node.data.description || '';
  }
</script>

<div class="properties-panel-content">
  <!-- --- NEW: Read-only Element ID field --- -->
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
    <label for="node-label">{$_('editor.task_name_label')}</label>
    <input 
      id="node-label"
      type="text" 
      bind:value={label}
      on:blur={handleUpdate}
      {disabled}
    />
  </div>

  <!-- --- NEW: Description textarea --- -->
  <div class="form-group">
    <label for="node-description">{$_('editor.description_label')}</label>
    <textarea 
      id="node-description"
      bind:value={description}
      on:blur={handleUpdate}
      rows="4"
      placeholder={$_('editor.description_placeholder')}
      {disabled}
    />
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
  textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input[type="text"]:focus,
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .readonly-input {
    cursor: not-allowed;
    color: var(--text-secondary);
    border: 1px solid #e5e7eb;
  }
  input:disabled, textarea:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  input,textarea,select {background-color: var(--bg-secondary);}
</style>
