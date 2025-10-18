<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let processData: {
    name: string;
    description: string;
    category: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
    businessProcessKey: string;
  };
  
  export let isNewProcess: boolean = true;

  const dispatch = createEventDispatcher();

  let { name, description, category, status, businessProcessKey } = processData;

  // --- FIX: Add a tracker for the current process key ---
  let currentProcessKey = processData.businessProcessKey;

  const statusOptions = ['DRAFT', 'ACTIVE', 'DEPRECATED'];

  function handleUpdate() {
    dispatch('update', {
      name,
      description,
      category,
      status,
      businessProcessKey
    });
  }

  // --- FIX: Break the reactive loop by checking against the tracker ---
  // This block will now only run when a completely different process is loaded into the panel.
  $: if (processData.businessProcessKey !== currentProcessKey) {
    ({ name, description, category, status, businessProcessKey } = processData);
    currentProcessKey = processData.businessProcessKey; // Update the tracker
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
    />
  </div>

  <div class="form-group">
    <label for="proc-key">Business Process Key</label>
    <input 
      id="proc-key"
      type="text" 
      bind:value={businessProcessKey}
      on:blur={handleUpdate}
      readonly={!isNewProcess}
      class:readonly-input={!isNewProcess}
      placeholder="e.g., PURCHASE_REQUEST"
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
    />
  </div>

  <div class="form-group">
    <label for="proc-status">Status</label>
    <select 
      id="proc-status"
      bind:value={status}
      on:change={handleUpdate}
    >
      {#each statusOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>
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
  small { margin-top: 0.375rem; font-size: 12px; color: #6b7280; }
</style>
