<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Node } from '@xyflow/svelte';
  import { _ } from 'svelte-i18n';

  export let node: Node;

  const dispatch = createEventDispatcher();

  let label = node.data.label || '';
  let description = node.data.description || '';

  function handleUpdate() {
    dispatch('update', {
      label,
      description
    });
  }

  $: if (node.id) {
    label = node.data.label || '';
    description = node.data.description || '';
  }
</script>

<div class="properties-panel-content">
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
    <label for="gateway-label">{$_('editor.task_name_label')}</label>
    <input 
      id="gateway-label"
      type="text" 
      bind:value={label}
      on:blur={handleUpdate}
      placeholder={$_('editor.gateway_label_placeholder')}
    />
  </div>

  <div class="form-group">
    <label for="node-description">{$_('editor.description_label')}</label>
    <textarea 
      id="node-description"
      bind:value={description}
      on:blur={handleUpdate}
      rows="4"
      placeholder={$_('editor.description_placeholder')}
    />
  </div>
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
  input, textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }
  input:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .readonly-input { cursor: not-allowed; color: var(--text-secondary); }
  input,textarea,select {background-color: var(--bg-secondary);}
</style>
