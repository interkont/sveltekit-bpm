<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { processDefinitionService } from '$lib/services/processDefinitionService';
  import { processInstanceService } from '$lib/services/processInstanceService';
  import type { StartFormDefinition, ProcessDefinition } from '$lib/types';
  import { toast } from '$lib/stores/toast';
  import { modal } from '$lib/stores/modal';
  import { _ } from 'svelte-i18n';
  import DynamicForm from '$lib/components/utils/DynamicForm.svelte';

  export let processDefinition: ProcessDefinition;

  const dispatch = createEventDispatcher();

  let formDefinition: StartFormDefinition | null = null;
  let businessData: Record<string, any> = {};
  let description: string = '';
  let isLoading = true;
  let isSubmitting = false;
  let error: string | null = null;

  onMount(async () => {
    if (!processDefinition) return; // Prevent API call if prop is null
    try {
      formDefinition = await processDefinitionService.getStartForm(processDefinition.id);
      // Initialize businessData, setting GRIDs to empty arrays and others to null
      formDefinition.fields.forEach(field => {
        if (field.fieldType === 'GRID') {
          businessData[field.name] = [];
        } else {
          businessData[field.name] = null;
        }
      });
    } catch (e) {
      error = e instanceof Error ? e.message : $_('start_process_form.error_loading_form');
    } finally {
      isLoading = false;
    }
  });

  // --- Reactive variable for form validation ---
  $: isFormValid = (() => {
    if (!formDefinition || !description.trim()) {
      return false;
    }

    for (const field of formDefinition.fields) {
        if (!field.validations.isRequired) {
            continue; // Skip non-required fields
        }

        const value = businessData[field.name];

        if (field.fieldType === 'GRID') {
            // A required grid is invalid if it's not an array or has no rows
            if (!Array.isArray(value) || value.length === 0) {
                return false;
            }
            // A required grid is also invalid if any cell in any row is empty
            const isAnyRowIncomplete = value.some(row =>
                field.validations.columns.some(col => {
                    const cellValue = row[col.name];
                    return cellValue === null || cellValue === undefined || cellValue === '';
                })
            );
            if (isAnyRowIncomplete) {
                return false;
            }
        } else {
            // Standard validation for other field types
            if (value === null || value === undefined || value === '') {
                return false;
            }
        }
    }
    return true;
  })();

  function confirmAndSubmit() {
    modal.show({
      title: $_('start_process_form.confirm_modal_title', { values: { concept: $_('concepts.instance_singular') } }),
      message: $_('start_process_form.confirm_modal_message', { values: { concept: $_('concepts.process_singular'), name: processDefinition.name } }),
      onConfirm: handleSubmit,
    });
  }

  async function handleSubmit() {
    if (!formDefinition || !isFormValid) return;
    isSubmitting = true;
    error = null;

    try {
      const payload = {
        businessProcessKey: processDefinition.businessProcessKey,
        description: description,
        businessData: businessData,
      };

      const response = await processInstanceService.createInstance(payload);
      toast.show(response.message || $_('start_process_form.success_toast', { values: { concept: $_('concepts.process_singular') } }), 'success');
      dispatch('navigate', { view: 'processes' }); // Navigate back to the list
    } catch (e) {
      error = e instanceof Error ? e.message : $_('start_process_form.error_starting_process', { values: { concept: $_('concepts.process_singular') } });
      toast.show(error, 'error');
    } finally {
      isSubmitting = false;
    }
  }

  function goBack() {
    dispatch('navigate', { view: 'new-process' });
  }
</script>

{#if processDefinition}
<div class="view-container">
  <div class="view-header">
     <button class="back-btn" on:click={goBack}>
       <Icon name="chevron-left" />
       {$_('start_process_form.back_to_selection')}
     </button>
  </div>

  <div class="title">
    <h2>{$_('start_process_form.title', { values: { name: processDefinition.name } })}</h2>
    <p>{processDefinition.description}</p>
  </div>

  <div class="form-container">
    {#if isLoading}
      <div class="state-placeholder"><Icon name="loader" size={24} spinning={true} /> {$_('start_process_form.loading')}</div>
    {:else if error}
      <div class="state-placeholder error"><Icon name="alert-triangle" size={24} /> {error}</div>
    {:else if formDefinition}
      <form on:submit|preventDefault={confirmAndSubmit}>
        <!-- General description field -->
        <div class="form-field">
          <label for="processDescription">{$_('start_process_form.description_label')}<span class="required-star">*</span></label>
          <input type="text" id="processDescription" bind:value={description} required placeholder={$_('start_process_form.description_placeholder')} />
        </div>

        <hr class="divider" />

        <!-- Dynamic fields from the API -->
        <DynamicForm fields={formDefinition.fields} bind:formData={businessData} />

        {#if error}
          <div class="error-banner">{error}</div>
        {/if}

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" on:click={goBack}>{$_('start_process_form.cancel_button')}</button>
          <button type="submit" class="btn btn-primary" disabled={!isFormValid || isSubmitting}>
            {#if isSubmitting}
              <Icon name="loader" size={16} spinning={true}/>
              <span>{$_('start_process_form.submitting_button')}</span>
            {:else}
              <Icon name="plus-circle" size={16}/>
              <span>{$_('start_process_form.submit_button')}</span>
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
{/if}

<style>
  .view-container { display: flex; flex-direction: column; gap: 1.5rem; }
  .view-header { display: flex; }
  .title h2 { margin: 0; color: var(--text-primary);font-size: 1.7rem; padding: 5px 0px; font-weight: 600; }
  .title p { margin: 0; color: var(--text-secondary); }

  .back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; font-size: 1rem; color: var(--text-secondary); cursor: pointer; font-weight: 500; }
  .back-btn:hover { color: var(--text-primary); }

  .form-container { background-color: var(--bg-primary); padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color); max-width: 75%; margin: 0 auto; width: 100%; }
  
  .state-placeholder { display: flex; align-items: center; justify-content: center; min-height: 200px; gap: 1rem; color: var(--text-secondary); }
  .state-placeholder.error { color: #c53030; }

  .divider { border: none; border-top: 1px solid var(--border-color); margin: 2rem 0; }
  
  .form-field { margin-bottom: 1.5rem; }
  .form-field label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
  .required-star { color: #c53030; margin-left: 0.25rem; }
  .form-field input, .form-field textarea {
    width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-color);
    background-color: var(--bg-secondary); color: var(--text-primary);
    border-radius: 8px; font-size: 1rem; box-sizing: border-box;
  }
  
  .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  .error-banner { color: #c53030; background-color: #f5656520; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
</style>
