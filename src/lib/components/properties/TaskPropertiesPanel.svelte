<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import type { Node } from '@xyflow/svelte';
  import { processRoleStore } from '$lib/stores/processRoleStore';
  import { fieldDefinitionStore } from '$lib/stores/fieldDefinitionStore';
  import type { FormFieldPayload, FieldDefinition } from '$lib/types';
  import Icon from '$lib/components/Icon.svelte';
  import Select from 'svelte-select';
  import Sortable from 'sortablejs';

  export let node: Node;
  export let disabled: boolean = false;
  export let formFields: FormFieldPayload[] = [];
  export let actions: string[] = [];
  export let isExpanded: boolean = false;

  const dispatch = createEventDispatcher();

  let label = node.data.label || '';
  let description = node.data.description || '';
  let assignedRoleId: number | null | '' = node.data.assignedRoleId ?? null;
  
  let localActions: string[] = [];
  let newAction = '';
  const suggestedActions = ['Approve', 'Reject', 'Return', 'Complete'];

  let linkedFields: FormFieldPayload[] = [];
  let availableFields: FieldDefinition[] = [];
  let selectedFieldToAdd: FieldDefinition | null = null;
  let openValidations = new Set<number>();

  $: {
    if (formFields && $fieldDefinitionStore.fieldMap.size > 0) {
      linkedFields = formFields.map(ff => ({ ...ff, fieldDefinition: $fieldDefinitionStore.fieldMap.get(ff.fieldDefId) })).filter(ff => ff.fieldDefinition).sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  $: {
    if ($fieldDefinitionStore.fields.length > 0) {
      const linkedFieldIds = new Set(linkedFields.map(f => f.fieldDefId));
      availableFields = $fieldDefinitionStore.fields.filter(f => !linkedFieldIds.has(f.id));
    }
  }

  function handleUpdate(dispatchActions = false) {
    const finalRoleId = assignedRoleId === '' ? null : Number(assignedRoleId);
    const selectedRole = $processRoleStore.roles.find(r => r.id === finalRoleId);
    
    const payload: Record<string, any> = { label, description, assignedRoleId: finalRoleId, assignedRoleName: selectedRole?.name || '' };
    if (dispatchActions) {
      payload.actions = localActions;
    }
    dispatch('update', payload);
  }

  function addAction(action: string) {
    const sanitizedAction = action.trim();
    if (sanitizedAction && !localActions.includes(sanitizedAction)) {
      localActions = [...localActions, sanitizedAction];
      handleUpdate(true);
    }
    newAction = '';
  }

  function removeAction(action: string) {
    localActions = localActions.filter(a => a !== action);
    handleUpdate(true);
  }

  function handleApplyFormFields() {
    const fieldsToDispatch = linkedFields.map((field, index) => {
      const { fieldDefinition, ...rest } = field;
      rest.displayOrder = index + 1;
      return rest;
    });
    dispatch('updateFormFields', { nodeId: node.id, fields: fieldsToDispatch });
    dispatch('togglePanel', { expand: false });
  }
  
  function handleCancel() {
    dispatch('togglePanel', { expand: false });
  }

  function handleAddField() {
    if (!selectedFieldToAdd) return;
    const newField: FormFieldPayload = {
      fieldDefId: selectedFieldToAdd.id,
      displayOrder: linkedFields.length + 1,
      isRequired: false,
      isReadonly: false,
      contextualValidations: null,
      fieldDefinition: selectedFieldToAdd
    };
    linkedFields = [...linkedFields, newField];
    selectedFieldToAdd = null;
  }
  
  function handleRemoveField(fieldDefId: number) {
    linkedFields = linkedFields.filter(f => f.fieldDefId !== fieldDefId);
  }

  function toggleValidation(fieldDefId: number) {
    openValidations.has(fieldDefId) ? openValidations.delete(fieldDefId) : openValidations.add(fieldDefId);
    openValidations = openValidations;
  }

  function handleValidationChange(event: Event, field: FormFieldPayload) {
      const target = event.target as HTMLTextAreaElement;
      try {
          if (!target.value) {
              field.contextualValidations = null;
          } else {
              field.contextualValidations = JSON.parse(target.value);
          }
          target.classList.remove('json-error');
      } catch (e) {
          target.classList.add('json-error');
      }
  }

  function sortable(node: HTMLElement) {
    const sortableInstance = new Sortable(node, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: (event) => {
        if (event.oldIndex === undefined || event.newIndex === undefined) return;
        const movedItem = linkedFields.splice(event.oldIndex, 1)[0];
        linkedFields.splice(event.newIndex, 0, movedItem);
        linkedFields = linkedFields;
      },
    });
    return { destroy: () => sortableInstance.destroy() }
  }

  let currentNodeId = node.id;
  $: if (node.id !== currentNodeId) {
    label = node.data.label || '';
    description = node.data.description || '';
    assignedRoleId = node.data.assignedRoleId ?? null;
    localActions = [...actions];
    currentNodeId = node.id;
    openValidations.clear();
  }

  onMount(() => {
    fieldDefinitionStore.fetchFields();
    localActions = [...actions];
  });

</script>

<div class="panel-layout" class:is-expanded={isExpanded}>
  <div class="properties-column">
    <div class="form-group">
      <label for="node-id">{$_('editor.element_id_label')}</label>
      <input id="node-id" type="text" readonly value={node.id} class="readonly-input" />
    </div>
    <div class="form-group">
      <label for="task-label">{$_('editor.task_name_label')}</label>
      <input id="task-label" type="text" bind:value={label} on:blur={() => handleUpdate()} {disabled} />
    </div>
    <div class="form-group">
      <label for="node-description">{$_('editor.description_label')}</label>
      <textarea id="node-description" bind:value={description} on:blur={() => handleUpdate()} rows="4" placeholder={$_('editor.description_placeholder')} {disabled} ></textarea>
    </div>
    <hr class="divider" />
    <div class="form-group">
      <label for="assigned-role">
        {$_('editor.role_assignment_label')}
        {#if node.type === 'startEvent'}({$_('editor.optional_label')}){/if}
      </label>
      {#if $processRoleStore.loading}
        <div class="loading-placeholder">{$_('process_model_list.loading')}</div>
      {:else}
        <select id="assigned-role" bind:value={assignedRoleId} on:change={() => handleUpdate()} class:error={node.type === 'userTask' && !assignedRoleId} {disabled}>
          <option value="">-- {$_('editor.no_role_assigned')} --</option>
          {#each $processRoleStore.roles as role (role.id)}
            <option value={role.id}>{role.name}</option>
          {/each}
        </select>
      {/if}
      {#if node.type === 'userTask' && !assignedRoleId}
        <span class="error-message">{$_('editor.role_required_error')}</span>
      {/if}
    </div>
    <hr class="divider" />

    {#if node.type === 'userTask'}
      <div class="form-group">
        <label for="task-actions">{$_('editor.actions_label')}</label>
        <div class="tags-container">
          {#each localActions as action}
            <div class="tag">
              {action}
              <button on:click={() => removeAction(action)} disabled={disabled}>&times;</button>
            </div>
          {/each}
        </div>
        <div class="add-action-container">
          <input type="text" bind:value={newAction} placeholder={$_('editor.add_action_placeholder')} on:keydown={(e) => e.key === 'Enter' && addAction(newAction)} disabled={disabled} />
          <button class="add-btn-sm" on:click={() => addAction(newAction)} disabled={disabled || !newAction.trim()}>
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div class="suggestions-container">
          <span>{$_('editor.suggested_actions_label')}</span>
          {#each suggestedActions as suggestion}
            {@const suggestionKey = `editor.action_${suggestion.toLowerCase()}`}
            {#if !localActions.includes($_(suggestionKey))}
              <button class="suggestion-btn" on:click={() => addAction($_(suggestionKey))} disabled={disabled}>+ {$_(suggestionKey)}</button>
            {/if}
          {/each}
        </div>
      </div>
      <hr class="divider" />
    {/if}
    
    {#if !isExpanded}
      <button class="form-fields-btn" on:click={() => dispatch('togglePanel', { expand: true })} {disabled}>
        <span>{$_('editor.form_data_button')}</span>
        <Icon name="arrow-right-circle" size={19} />
      </button>
    {/if}
  </div>

  {#if isExpanded}
    <div class="form-fields-column">
      <div class="panel-header">
        <h4 class="form-panel-title">{$_('editor.form_fields_title')}</h4>
      </div>
      
      <div class="add-field-container">
        <div class="select-wrapper">
          <Select
            bind:value={selectedFieldToAdd}
            items={availableFields}
            getOptionLabel={(option) => option.label}
            placeholder={$_('editor.add_field_placeholder')}
            isDisabled={disabled}
          />
        </div>
        <button class="add-btn" on:click={handleAddField} disabled={!selectedFieldToAdd || disabled}>
          <Icon name="plus" size={16} /> {$_('editor.add_button')}
        </button>
      </div>

      <div class="linked-fields-list-container">
        {#if linkedFields.length === 0}
          <div class="empty-list-placeholder">{$_('editor.no_fields_placeholder')}</div>
        {:else}
          <ul class="linked-fields-list" use:sortable>
            {#each linkedFields as field (field.fieldDefId)}
              <li class="linked-field-item-wrapper">
                <div class="linked-field-item">
                  <div class="drag-handle">
                    <Icon name="grip-horizontal" size={16} />
                  </div>
                  <div class="field-main-content">
                    <div class="field-info">
                      <span class="field-label" title={field.fieldDefinition?.label}>{field.fieldDefinition?.label}</span>
                      <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{field.fieldDefinition?.fieldType}</span>
                    </div>
                    <div class="field-controls">
                      <label title={$_('editor.required_tooltip')}>
                        <input type="checkbox" bind:checked={field.isRequired} disabled={disabled} />
                        {$_('editor.required_abbr')}
                      </label>
                      <label title={$_('editor.readonly_tooltip')}>
                        <input type="checkbox" bind:checked={field.isReadonly} disabled={disabled} />
                        {$_('editor.readonly_abbr')}
                      </label>
                    </div>
                  </div>
                  <div class="field-actions">
                    <button class="icon-btn" on:click={() => toggleValidation(field.fieldDefId)} title={$_('editor.contextual_validations_tooltip')} class:active={openValidations.has(field.fieldDefId)} disabled={disabled}>
                      <Icon name="code" size={16} />
                    </button>
                    <button class="icon-btn remove-btn" on:click={() => handleRemoveField(field.fieldDefId)} title={$_('editor.remove_field_tooltip')} disabled={disabled}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
                {#if openValidations.has(field.fieldDefId)}
                <div class="validation-panel">
                  <label for={`validation-${field.fieldDefId}`}>{$_('editor.contextual_validations_label')}</label>
                  <textarea
                    id={`validation-${field.fieldDefId}`}
                    rows="4"
                    placeholder={`{ "minRows": 1 }`}
                    on:blur={(e) => handleValidationChange(e, field)}
                    disabled={disabled}
                  >{field.contextualValidations ? JSON.stringify(field.contextualValidations, null, 2) : ''}</textarea>
                </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="form-actions-footer">
        <button class="cancel-btn" on:click={handleCancel} {disabled}>{$_('editor.cancel_button')}</button>
        <button class="apply-btn" on:click={handleApplyFormFields} {disabled}>{$_('editor.apply_changes_button')}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.svelte-select) { --background: var(--bg-secondary); --border: 1px solid var(--border-color); --border-radius: 6px; --font-size: 14px; --height: 43.6px; --placeholder-color: var(--text-secondary); --item-hover-bg: var(--bg-tertiary); --item-is-active-color: var(--accent-color); --list-background: var(--bg-secondary); }
  :global(.svelte-select-list) { z-index: 10; border: 1px solid var(--border-color); }
  :global(.svelte-select__clear-indicator) { color: var(--text-secondary); }
  :global(.svelte-select-input) { display: grid; grid-template-columns: 1fr; }
  :global(.svelte-select-input > *) { grid-column: 1; grid-row: 1; width: 100%; }
  :global(.value-container) { max-width: 13.6rem; }
  .panel-layout { display: grid; grid-template-columns: 1fr; width: 100%; }
  .panel-layout.is-expanded { grid-template-columns: 300px 1fr; }
  .properties-column { display: flex; flex-direction: column; gap: 1.25rem; padding-right: 1rem; }
  .form-fields-column { display: flex; flex-direction: column; gap: 1rem; padding-left: 1rem; border-left: 1px solid var(--border-color); }
  .panel-header { display: flex; align-items: center; gap: 0.75rem; }
  .form-panel-title { margin: 0; font-size: 1.1rem; font-weight: 600; }
  .form-fields-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-secondary); border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
  .form-fields-btn:hover { border-color: var(--accent-color); background-color: var(--bg-hover); }
  
  .add-field-container { display: flex; gap: 0.5rem; }
  .select-wrapper { flex-grow: 1; min-width: 0; }
  .add-btn { display: flex; align-items: center; gap: 0.5rem; background-color: #22c55e; color: white; border: none; padding: 0 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .add-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

  .linked-fields-list-container { flex-grow: 1; overflow-y: auto; padding-right: 4px; }
  .empty-list-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; border: 2px dashed var(--border-color); border-radius: 8px; color: var(--text-secondary); }
  .linked-fields-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .linked-field-item-wrapper { display: flex; flex-direction: column; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; }
  .linked-field-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; }
  
  .drag-handle { cursor: grab; color: var(--text-secondary); padding: 0.5rem; }
  .drag-handle:active { cursor: grabbing; }

  .field-main-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .field-info { display: flex; align-items: center; gap: 0.5rem; justify-content: space-between; }
  .field-label { font-weight: 500; white-space: normal; overflow: hidden; text-overflow: ellipsis; }
  
  .field-controls { display: flex; gap: 1rem; font-size: 0.875rem; }
  .field-controls label { display: flex; align-items: center; gap: 0.25rem; cursor: pointer; }

  .field-actions { display: flex; flex-direction: column; gap: 0.25rem; }
  .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.25rem; border-radius: 4px; }
  .icon-btn:hover { color: var(--text-primary); background-color: var(--bg-hover); }
  .icon-btn.active { color: var(--accent-color); }
  .remove-btn:hover { color: #ef4444; background-color: #fee2e2; }

  .validation-panel { padding: 0 0.75rem 0.75rem 0.75rem; }
  .validation-panel label { font-size: 0.8rem; font-weight: 500; margin-bottom: 0.25rem; }

  .form-actions-footer { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .apply-btn, .cancel-btn { border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
  .apply-btn { background-color: var(--accent-color); color: white; }
  .apply-btn:hover { opacity: 0.9; }
  .cancel-btn { background-color: var(--bg-secondary); border: 1px solid var(--border-color); }

  .form-group { display: flex; flex-direction: column; }
  label { font-weight: 500; margin-bottom: 0.375rem; font-size: 14px; }
  input, textarea, select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
  .json-error { border-color: #ef4444 !important; }
  .readonly-input { cursor: not-allowed; color: var(--text-secondary); }
  input:disabled, textarea:disabled, select:disabled { cursor: not-allowed; opacity: 0.7; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }
  select.error { border-color: #ef4444; }
  .error-message { font-size: 12px; color: #ef4444; margin-top: 0.25rem; }
  .loading-placeholder { padding: 0.6rem 0.75rem; background-color: var(--bg-secondary); border-radius: 6px; color: var(--text-secondary); font-style: italic; }
  input,textarea,select { background-color: var(--bg-secondary); }
  
  .tags-container { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
  .tag { display: flex; align-items: center; background-color: var(--accent-color); color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.875rem; }
  .tag button { background: none; border: none; color: white; margin-left: 0.5rem; cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; }
  
  .add-action-container { display: flex; gap: 0.5rem; }
  .add-action-container input { flex-grow: 1; }
  .add-btn-sm { display: flex; align-items: center; justify-content: center; background-color: #22c55e; color: white; border: none; padding: 0 0.75rem; border-radius: 6px; cursor: pointer; }
  .add-btn-sm:disabled { background-color: #9ca3af; cursor: not-allowed; }
  
  .suggestions-container { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-secondary); }
  .suggestion-btn { background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.2rem 0.6rem; border-radius: 6px; cursor: pointer; }
  .suggestion-btn:hover { background-color: var(--bg-hover); }
</style>
