<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { _ } from 'svelte-i18n';
  import Icon from '$lib/components/Icon.svelte';
  import type { FieldDefinition } from '$lib/types';
  import { fieldDefinitionStore } from '$lib/stores/fieldDefinitionStore';
  import { toast } from '$lib/stores/toast';
  import type { FieldDefinitionPayload } from '$lib/services/fieldDefinitionService';

  export let isOpen: boolean;
  export let field: FieldDefinition | null = null;

  const dispatch = createEventDispatcher();

  // --- Form state variables ---
  let formLabel = '';
  let formName = '';
  let formFieldType: FieldDefinition['fieldType'] = 'TEXT';
  let validationsJSONString = '';
  
  let selectOptions: { label: string; value: string }[] = [];
  let gridColumns: { name: string; label: string; type: FieldDefinition['fieldType']; options?: { label: string; value: string }[] }[] = [];
  let gridDataSource = '';

  let isOptionsModalOpen = false;
  type EditingContext = { type: 'top-level' } | { type: 'grid'; index: number };
  let editingContext: EditingContext | null = null;

  let isSubmitting = false;
  const fieldTypes: FieldDefinition['fieldType'][] = ['TEXT', 'NUMBER', 'DATE', 'TEXTAREA', 'SELECT', 'GRID', 'FILE'];
  const gridColumnTypes: FieldDefinition['fieldType'][] = ['TEXT', 'NUMBER', 'DATE', 'FILE', 'SELECT'];

  $: if (isOpen) {
    if (field) {
      formLabel = field.label;
      formName = field.name;
      formFieldType = field.fieldType;
      const validations = field.validations || {};
      selectOptions = validations.options || [];
      gridColumns = (validations.columns || []).map((c: any) => ({ ...c, options: c.options || [] }));
      gridDataSource = validations.dataSource || '';
      const otherValidations = { ...validations };
      delete otherValidations.options;
      delete otherValidations.columns;
      delete otherValidations.dataSource;
      const currentValidationsStr = JSON.stringify(otherValidations, null, 2);
      validationsJSONString = currentValidationsStr === '{}' ? '' : currentValidationsStr;
    } else {
      formLabel = ''; formName = ''; formFieldType = 'TEXT'; validationsJSONString = '';
      selectOptions = []; gridColumns = []; gridDataSource = '';
    }
  }

  // --- FIX: Populate the `texts` object with ALL required translations ---
  $: texts = {
    title: field ? $_('data_library.editor.edit_title', { values: { label: field.label } }) : $_('data_library.editor.create_title'),
    label_label: $_('data_library.editor.label_label'),
    label_placeholder: $_('data_library.editor.label_placeholder'),
    name_label: $_('data_library.editor.name_label'),
    name_placeholder: $_('data_library.editor.name_placeholder'),
    name_helper: $_('data_library.editor.name_helper'),
    type_label: $_('data_library.editor.type_label'),
    validations_title: $_('data_library.editor.validations_title'),
    validations_json_label: $_('data_library.editor.validations_json_label'),
    validations_json_helper: $_('data_library.editor.validations_json_helper'),
    add_option: $_('data_library.editor.add_option'),
    add_column: $_('data_library.editor.add_column'),
    option_label_placeholder: $_('data_library.editor.option_label_placeholder'),
    option_value_placeholder: $_('data_library.editor.option_value_placeholder'),
    column_name_placeholder: $_('data_library.editor.column_name_placeholder'),
    column_label_placeholder: $_('data_library.editor.column_label_placeholder'),
    datasource_label: $_('data_library.editor.datasource_label'),
    datasource_placeholder: $_('data_library.editor.datasource_placeholder'),
    configure_options: $_('data_library.editor.configure_options'),
    options_editor_title: $_('data_library.editor.options_editor_title'),
    done_button: $_('data_library.editor.done_button')
  };

  function handleClose() { dispatch('close'); }

  function openOptionsEditor(context: EditingContext) {
    editingContext = context;
    isOptionsModalOpen = true;
  }
  function closeOptionsEditor() {
    isOptionsModalOpen = false;
    editingContext = null;
  }
  
  $: currentEditingOptions = (() => {
    if (!editingContext) return [];
    if (editingContext.type === 'top-level') return selectOptions;
    if (editingContext.type === 'grid') return gridColumns[editingContext.index].options || [];
    return [];
  })();

  function addOptionToModal() {
    const newOption = { label: '', value: '' };
    if (!editingContext) return;
    if (editingContext.type === 'top-level') {
      selectOptions = [...selectOptions, newOption];
    } else if (editingContext.type === 'grid') {
      const index = editingContext.index;
      if (!gridColumns[index].options) gridColumns[index].options = [];
      gridColumns[index].options = [...gridColumns[index].options!, newOption];
      gridColumns = [...gridColumns];
    }
  }

  function removeOptionFromModal(optionIndex: number) {
    if (!editingContext) return;
    if (editingContext.type === 'top-level') {
      selectOptions = selectOptions.filter((_, i) => i !== optionIndex);
    } else if (editingContext.type === 'grid') {
      const index = editingContext.index;
      gridColumns[index].options = (gridColumns[index].options || []).filter((_, i) => i !== optionIndex);
      gridColumns = [...gridColumns];
    }
  }

  function addColumn() { gridColumns = [...gridColumns, { name: '', label: '', type: 'TEXT', options: [] }]; }
  function removeColumn(index: number) { gridColumns = gridColumns.filter((_, i) => i !== index); }
  
  async function handleSubmit() {
    if (!formName || !formLabel) { toast.show($_('data_library.editor.validation_error_required'), 'error'); return; }
    let parsedValidations: Record<string, any> = {};
    try {
      if (formFieldType === 'SELECT') {
        parsedValidations = { options: selectOptions };
      } else if (formFieldType === 'GRID') {
        const cleanedColumns = gridColumns.map(col => {
          if (col.type !== 'SELECT') {
            const { options, ...rest } = col;
            return rest;
          }
          return col;
        });
        parsedValidations = { dataSource: gridDataSource, columns: cleanedColumns };
      } else {
        parsedValidations = JSON.parse(validationsJSONString.trim() || '{}');
      }
    } catch (e) { toast.show($_('data_library.editor.validation_error_json'), 'error'); return; }

    const payload: FieldDefinitionPayload = { label: formLabel, name: formName, fieldType: formFieldType, validations: parsedValidations };
    isSubmitting = true;
    try {
      if (field && field.id) { await fieldDefinitionStore.updateField(field.id, payload); } 
      else { await fieldDefinitionStore.createField(payload); }
      toast.show(field ? $_('data_library.editor.update_success') : $_('data_library.editor.create_success'), 'success');
      handleClose();
    } catch (e) { /* Handled by apiService */ } 
    finally { isSubmitting = false; }
  }
</script>

{#if isOpen}
  <div class="panel-overlay" on:click={handleClose} role="presentation">
    <div class="panel-content" on:click|stopPropagation transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }} role="presentation">
      <header class="panel-header"><h2 class="panel-title">{texts.title}</h2><button class="btn-close" on:click={handleClose} title={$_('process_detail.close_panel')}> <Icon name="x" /> </button></header>
      <div class="panel-body">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group"><label for="field-label" class="form-label">{texts.label_label}</label><input type="text" id="field-label" class="form-input" bind:value={formLabel} placeholder={texts.label_placeholder}></div>
          <div class="form-group"><label for="field-name" class="form-label">{texts.name_label}</label><input type="text" id="field-name" class="form-input" bind:value={formName} placeholder={texts.name_placeholder}><p class="helper-text">{texts.name_helper}</p></div>
          <div class="form-group"><label for="field-type" class="form-label">{texts.type_label}</label><select id="field-type" class="form-input" bind:value={formFieldType}>{#each fieldTypes as type}<option value={type}>{type}</option>{/each}</select></div>
          <div class="form-group">
            <h3 class="form-label">{texts.validations_title}</h3>
            {#if formFieldType === 'SELECT'}
              <button type="button" class="btn btn-secondary" on:click={() => openOptionsEditor({ type: 'top-level' })}> <Icon name="settings" class="mr-2"/> {texts.configure_options} </button>
            {:else if formFieldType === 'GRID'}
              <div class="form-group"><label for="grid-datasource" class="form-label">{texts.datasource_label}</label><input id="grid-datasource" class="form-input" bind:value={gridDataSource} placeholder={texts.datasource_placeholder} /></div>
              <div class="validation-list">
                {#each gridColumns as column, index}
                  <div class="list-item grid-item">
                    <input class="form-input list-input" bind:value={column.name} placeholder={texts.column_name_placeholder} />
                    <input class="form-input list-input" bind:value={column.label} placeholder={texts.column_label_placeholder} />
                    <select class="form-input list-input" bind:value={column.type}>{#each gridColumnTypes as type}<option value={type}>{type}</option>{/each}</select>
                    <div class="actions-cell">
                      {#if column.type === 'SELECT'}
                        <button type="button" class="btn-icon" on:click={() => openOptionsEditor({ type: 'grid', index })} title={texts.configure_options}><Icon name="settings"/></button>
                      {/if}
                      <button type="button" class="btn-icon btn-icon-danger" on:click={() => removeColumn(index)} title={$_('list.delete_action')}> <Icon name="trash" /> </button>
                    </div>
                  </div>
                {/each}
                <button type="button" class="btn btn-secondary btn-sm mt-2" on:click={addColumn}> <Icon name="plus" class="mr-1" /> {texts.add_column} </button>
              </div>
            {:else}
              <div class="form-group"><label for="field-validations" class="form-label sr-only">{texts.validations_json_label}</label><textarea id="field-validations" rows="4" class="form-input monospace" placeholder='&lbrace; "maxLength": 100 &rbrace;' bind:value={validationsJSONString}></textarea><p class="helper-text">{texts.validations_json_helper}</p></div>
            {/if}
          </div>
        </form>
      </div>
      <footer class="panel-footer">
        <button type="button" class="btn btn-secondary" on:click={handleClose}>{$_('list.cancel_button')}</button>
        <button type="button" class="btn btn-primary" on:click={handleSubmit} disabled={isSubmitting}>{#if isSubmitting}<Icon name="loader" size={16} spinning={true} class="mr-2" /><span>{$_('list.saving_button')}</span>{:else}<Icon name="save" size={16} class="mr-2" /><span>{$_('list.save_button')}</span>{/if}</button>
      </footer>
    </div>
  </div>
{/if}

{#if isOptionsModalOpen}
<div class="modal-backdrop">
  <div class="modal-content">
    <header class="modal-header"><h3 class="modal-title">{texts.options_editor_title}</h3><button class="btn-close" on:click={closeOptionsEditor}><Icon name="x" /></button></header>
    <div class="modal-body validation-list">
      {#each currentEditingOptions as option, i}
        <div class="list-item">
          <input class="form-input list-input" bind:value={option.label} placeholder={texts.option_label_placeholder} />
          <input class="form-input list-input" bind:value={option.value} placeholder={texts.option_value_placeholder} />
          <button type="button" class="btn-icon btn-icon-danger" on:click={() => removeOptionFromModal(i)} title={$_('list.delete_action')}> <Icon name="trash" /> </button>
        </div>
      {/each}
      <button type="button" class="btn btn-secondary btn-sm mt-2" on:click={addOptionToModal}> <Icon name="plus" class="mr-1" /> {texts.add_option} </button>
    </div>
    <footer class="modal-footer"><button class="btn btn-primary" on:click={closeOptionsEditor}>{texts.done_button}</button></footer>
  </div>
</div>
{/if}

<style>
  .panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: flex-end; }
  .panel-content { background: var(--bg-primary); width: 100%; max-width: 520px; height: 100%; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
  .panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .panel-title { font-size: 1.25rem; font-weight: 600; }
  .btn-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
  .panel-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; }
  .form-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); font-size: 1rem; color: var(--text-primary); transition: all 0.2s; }
  .form-input:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-color-light); }
  .panel-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; align-items: center; gap: 1rem; background: var(--bg-primary); flex-shrink: 0; }
  .btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; }
  .btn-primary { background-color: var(--accent-color); color: white; }
  .btn-primary:hover { filter: brightness(1.1); }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background: var(--bg-tertiary); }
  .helper-text { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; }
  .monospace { font-family: var(--font-mono); }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
  .mr-2, .mr-1 { margin-right: 0.5rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .validation-list { display: flex; flex-direction: column; gap: 0.5rem; background-color: var(--bg-secondary); border-radius: 8px; padding: 1rem; border: 1px solid var(--border-color); }
  .list-item { display: flex; align-items: center; gap: 0.5rem; }
  .list-item.grid-item { display: grid; grid-template-columns: 1fr 1fr 1fr auto; }
  .list-input { font-size: 0.875rem; padding: 0.5rem; }
  .btn-sm { padding: 0.35rem 0.8rem; font-size: 0.85rem; font-weight: 600; }
  .btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.2s ease; }
  .btn-icon-danger:hover { color: #e53e3e; background-color: rgba(229, 62, 62, 0.1); }
  .actions-cell { display: flex; align-items: center; gap: 0.25rem; }

  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; }
  .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-primary); border-radius: 12px; box-shadow: var(--shadow-large); z-index: 1001; width: 90%; max-width: 500px; display: flex; flex-direction: column; }
  .modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .modal-title { font-weight: 600; font-size: 1.1rem; }
  .modal-body { padding: 1.5rem; max-height: 60vh; overflow-y: auto; }
  .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
</style>
