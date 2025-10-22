<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

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
  
  const userStatusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE'];
  
  // This will be our manually controlled state variable for the button
  let isValid = false;

  function isFormValid() {
    if (!processData) return false;
    return processData.name.trim() !== '' && 
           processData.businessProcessKey.trim() !== '' && 
           processData.description.trim() !== '';
  }

  // Reactive statement to PRESERVE the 'DEPRECATED' status logic
  $: allStatusOptions = (processData && processData.status === 'DEPRECATED')
    ? [...userStatusOptions, 'DEPRECATED']
    : [...userStatusOptions];

  onMount(() => {
    // Set the initial state for the button on component load
    handleUpdate();
  });

  function handleUpdate() {
    // Manually assign the new value to trigger Svelte's reactivity
    isValid = isFormValid();

    // Continue to inform the parent component as it was working correctly
    dispatch('validation', { isValid: isValid });
  }

  function handleSaveMetadata() {
    dispatch('saveMetadata');
  }
</script>

<div class="properties-panel-content">
  <div class="form-group">
    <label for="proc-name">Process Name</label>
    <input 
      id="proc-name"
      type="text" 
      bind:value={processData.name}
      on:input={handleUpdate}
      placeholder="e.g., Purchase Request"
      {disabled}
      required
    />
  </div>

  <div class="form-group">
    <label for="proc-key">Business Process Key</label>
    <input 
      id="proc-key"
      type="text" 
      bind:value={processData.businessProcessKey}
      on:input={handleUpdate}
      readonly={!isNewProcess || disabled}
      class:readonly-input={!isNewProcess || disabled}
      placeholder="e.g., PURCHASE_REQUEST"
      {disabled}
      required
    />
    <small>Unique identifier. Cannot be changed after creation.</small>
  </div>

  <div class="form-group">
    <label for="proc-desc">Description</label>
    <textarea 
      id="proc-desc"
      bind:value={processData.description}
      on:input={handleUpdate}
      rows="4"
      placeholder="A brief summary of what this process does."
      {disabled}
      required
    />
  </div>

  <div class="form-group">
    <label for="proc-category">Category</label>
    <input 
      id="proc-category"
      type="text" 
      bind:value={processData.category}
      on:input={handleUpdate}
      placeholder="e.g., Finance"
      {disabled}
    />
  </div>

  <div class="form-group">
    <label for="proc-status">Status</label>
    <select 
      id="proc-status"
      bind:value={processData.status}
      on:change={handleUpdate}
      {disabled}
    >
      {#each allStatusOptions as option}
        <option value={option} disabled={option === 'DEPRECATED' && processData.status !== 'DEPRECATED'}>
          {option}
        </option>
      {/each}
    </select>
  </div>

  {#if !disabled && !isNewProcess}
    <button class="save-metadata-btn" on:click={handleSaveMetadata} disabled={!isValid}>
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
  .save-metadata-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }
</style>
