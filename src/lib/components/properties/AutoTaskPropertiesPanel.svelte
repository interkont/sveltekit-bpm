<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Node } from '@xyflow/svelte';
  import BasicPropertiesPanel from './BasicPropertiesPanel.svelte';

  export let node: Node;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  let webhook = node.data.webhook || '';

  function handleWebhookUpdate() {
    dispatch('update', {
      webhook
    });
  }

  $: if (node.id) {
    webhook = node.data.webhook || '';
  }
</script>

<BasicPropertiesPanel {node} on:update {disabled} />

<hr class="divider" />

<div class="properties-panel-content">
  <div class="form-group">
    <label for="webhook-url">Webhook to Call</label>
    <input 
      id="webhook-url"
      type="url" 
      bind:value={webhook}
      on:blur={handleWebhookUpdate}
      placeholder="https://your-automation-url.com/..."
      {disabled}
    />
    <small>Enter the full URL of the webhook to be triggered.</small>
  </div>
</div>

<style>
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
  .properties-panel-content, .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  label { font-weight: 500; font-size: 14px;}
  input { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
  input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
  input:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  small { font-size: 12px; color: #6b7280; }
  input,textarea,select {background-color: var(--bg-secondary);}
</style>
