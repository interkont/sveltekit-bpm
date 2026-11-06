<script lang="ts">
  import type { FormField } from '$lib/types';
  import { _ } from 'svelte-i18n';
  import EditableGrid from '$lib/components/utils/EditableGrid.svelte';

  export let fields: FormField[];
  export let formData: Record<string, any>;
  export let readonly: boolean = false;
</script>

<div class="dynamic-form-grid">
  {#each fields as field (field.name)}
    <div class="form-field" class:grid-full-width={field.fieldType === 'GRID'}>
      <label for={field.name}>
        {field.label}
        {#if !readonly && field.validations?.isRequired}
          <span class="required-star">*</span>
        {/if}
      </label>
      
      {#if readonly}
        <div class="value-box">
          {#if field.fieldType === 'DATE' && formData[field.name]}
            {new Date(formData[field.name]).toLocaleDateString()}
          {:else if field.fieldType === 'SELECT'}
            {field.validations.options?.find(opt => opt.value === formData[field.name])?.label || formData[field.name] || 'N/A'}
          {:else if field.fieldType === 'GRID'}
            <EditableGrid 
              columns={field.validations.columns || []} 
              value={formData[field.name] || []} 
              readonly={true} 
            />
          {:else}
            {formData[field.name] || 'N/A'}
          {/if}
        </div>
      {:else}
        {#if field.fieldType === 'NUMBER'}
          <input type="number" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} disabled={field.validations?.isReadonly} />
        {:else if field.fieldType === 'TEXTAREA'}
          <textarea id={field.name} rows="4" bind:value={formData[field.name]} required={field.validations?.isRequired} disabled={field.validations?.isReadonly}></textarea>
        {:else if field.fieldType === 'DATE'}
          <input type="date" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} disabled={field.validations?.isReadonly} />
        {:else if field.fieldType === 'SELECT'}
          <select id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} disabled={field.validations?.isReadonly}>
            <option value={null}>{$_('forms.select_placeholder')}</option>
            {#each field.validations.options || [] as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        {:else if field.fieldType === 'GRID'}
          <EditableGrid 
            columns={field.validations.columns || []} 
            bind:value={formData[field.name]} 
            readonly={field.validations?.isReadonly} 
          />
        {:else} <!-- Default to TEXT -->
          <input type="text" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} disabled={field.validations?.isReadonly} />
        {/if}
      {/if}
    </div>
  {/each}
</div>

<style>
  .dynamic-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .grid-full-width {
    grid-column: 1 / -1;
  }

  .form-field label {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .required-star {
    color: #c53030;
    margin-left: 0.25rem;
  }

  .form-field input,
  .form-field textarea,
  .form-field select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    min-height: 44px;
  }

  .form-field input:disabled,
  .form-field textarea:disabled,
  .form-field select:disabled {
    background-color: var(--bg-hover);
    cursor: not-allowed;
  }

  .value-box {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-wrap: break-word;
    min-height: 44px; /* Align with input height */
  }

  /* When a grid is readonly, remove padding and some styles from value-box */
  .value-box:has(> .grid-container.readonly) {
      padding: 0;
      background-color: transparent;
      border: none;
      min-height: auto;
  }
  select {height: 51px;}
</style>
