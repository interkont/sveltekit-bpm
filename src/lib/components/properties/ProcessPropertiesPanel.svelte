<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  export let processData: {
    name: string;
    description: string;
    category: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
    businessProcessKey: string;
  };
  
  export let disabled: boolean = false;
  export let isNewProcess: boolean = true;

  const dispatch = createEventDispatcher();

  let { name, description, category, status, businessProcessKey } = processData;

  let currentProcessKey = processData.businessProcessKey;
  
  // User-selectable options
  const userStatusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE'];
  
  // The full list of options, which might include a non-selectable current status
  let allStatusOptions = [...userStatusOptions];

  onMount(() => {
    if (status === 'DEPRECATED' && !allStatusOptions.includes('DEPRECATED')) {
      allStatusOptions.push('DEPRECATED');
    }
  });

  function handleUpdate() {
    dispatch('update', { name, description, category, status, businessProcessKey });
  }

  function handleSaveMetadata() {
    handleUpdate();
    dispatch('saveMetadata');
  }

  $: if (processData.businessProcessKey !== currentProcessKey) {
    ({ name, description, category, status, businessProcessKey } = processData);
    currentProcessKey = processData.businessProcessKey;
    // Re-evaluate if DEPRECATED needs to be in the list for the newly loaded process
    if (status === 'DEPRECATED' && !allStatusOptions.includes('DEPRECATED')) {
      allStatusOptions = [...userStatusOptions, 'DEPRECATED'];
    } else if (status !== 'DEPRECATED') {
      allStatusOptions = [...userStatusOptions];
    }
  }
</script>

<div class="properties-panel-content">
  <div class="form-group">
    <label for="proc-name">Process Name</label>
    <input 
      id="proc-name"
      type="text" 
      bind:value={name}
      on:blur={handleUpdate}
      placeholder="e.g., Purchase Request"
      {disabled}
    />
  </div>

  <div class="form-group">
    <label for="proc-key">Business Process Key</label>
    <input 
      id="proc-key"
      type="text" 
      bind:value={businessProcessKey}
      on:blur={handleUpdate}
      readonly={!isNewProcess || disabled}
      class:readonly-input={!isNewProcess || disabled}
      placeholder="e.g., PURCHASE_REQUEST"
      {disabled}
    />
    <small>Unique identifier. Cannot be changed after creation.</small>
  </div>

  <div class="form-group">
    <label for="proc-desc">Description</label>
    <textarea 
      id="proc-desc"
      bind:value={description}
      on:blur={handleUpdate}
      rows="4"
      placeholder="A brief summary of what this process does."
      {disabled}
    />
  </div>

  <div class="form-group">
    <label for="proc-category">Category</label>
    <input 
      id="proc-category"
      type="text" 
      bind:value={category}
      on:blur={handleUpdate}
      placeholder="e.g., Finance"
      {disabled}
    />
  </div>

  <div class="form-group">
    <label for="proc-status">Status</label>
    <select 
      id="proc-status"
      bind:value={status}
      on:change={handleUpdate}
      {disabled}
    >
      {#each allStatusOptions as option}
        <option value={option} disabled={option === 'DEPRECATED' && status !== 'DEPRECATED'}>
          {option}
        </option>
      {/each}
    </select>
  </div>

  {#if !disabled && !isNewProcess}
    <button class="save-metadata-btn" on:click={handleSaveMetadata}>
      Actualizar Propiedades
    </button>
  {/if}
</div>

<style>
  .properties-panel-content { display: flex; flex-direction: column; gap: 1.25rem; }
  .form-group { display: flex; flex-direction: column; }
  label { font-weight: 500; margin-bottom: 0.375rem; font-size: 14px;}
  input, textarea, select {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  input,textarea,select {background-color: var(--bg-secondary);}
  .readonly-input { cursor: not-allowed; color: var(--text-secondary); }
  input:disabled, textarea:disabled, select:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  option:disabled {
    color: #9ca3af;
  }
  small { margin-top: 0.375rem; font-size: 12px; color: #6b7280; }
  .save-metadata-btn {
    margin-top: 0.5rem;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .save-metadata-btn:hover { background-color: #059669; }
</style>
