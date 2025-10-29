<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { fieldDefinitionStore } from '$lib/stores/fieldDefinitionStore';
  import Icon from '$lib/components/Icon.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import FieldEditorPanel from '$lib/components/FieldEditorPanel.svelte';
  import DataTable from '$lib/components/utils/DataTable.svelte';
  import type { FieldDefinition } from '$lib/types';
  import { modal } from '$lib/stores/modal';
  import { toast } from '$lib/stores/toast';

  let isPanelOpen = false;
  let editingField: FieldDefinition | null = null;
  let searchTerm = '';

  $: fields = $fieldDefinitionStore.fields;
  $: isLoading = $fieldDefinitionStore.loading;
  $: error = $fieldDefinitionStore.error;

  onMount(() => {
    fieldDefinitionStore.fetchFields();
  });

  $: filteredFields = fields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- MODIFICATION: Add `sortable: true` to columns ---
  $: columns = [
    { key: 'label', title: $_('data_library.table_header_label'), sortable: true },
    { key: 'name', title: $_('data_library.table_header_name'), sortable: true },
    { key: 'fieldType', title: $_('data_library.table_header_type'), sortable: true },
    { key: 'actions', title: $_('list.actions_header'), class: 'text-center' }
  ];

  function handleCreate() {
    editingField = null;
    isPanelOpen = true;
  }

  function handleEdit(field: FieldDefinition) {
    editingField = field;
    isPanelOpen = true;
  }

  function handleDelete(field: FieldDefinition) {
    modal.show({
      title: $_('data_library.delete_confirm_title'),
      message: $_('data_library.delete_confirm_message', { values: { label: field.label } }),
      onConfirm: async () => {
        await fieldDefinitionStore.deleteField(field.id);
        toast.show($_('data_library.delete_success', { values: { label: field.label } }), 'success');
      }
    });
  }

  function handlePanelClose() {
    isPanelOpen = false;
    editingField = null;
  }

</script>

<div class="view-container">
  <header class="view-header">
    <div>
      <h1 class="header-title">{$_('data_library.title')}</h1>
      <p class="header-description">{$_('data_library.description')}</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary" on:click={handleCreate}>
        <Icon name="plus" size={16} class="mr-2" />
        <span>{$_('data_library.create_button')}</span>
      </button>
    </div>
  </header>

  <div class="view-content">
    <DataTable
      items={filteredFields}
      {columns}
      loading={isLoading && fields.length === 0}
      {error}
      bind:searchTerm
      searchPlaceholder={$_('data_library.search_placeholder')}
      emptyMessage={$_('data_library.no_fields_found')}
      emptyIcon="file-text"
    >
      <div slot="cell" let:item let:column>
        {#if column.key === 'name'}
          <span class="monospace">{item.name}</span>
        {:else if column.key === 'fieldType'}
          <span class="px-2 py-px text-xs font-semibold rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300">{item.fieldType}</span>
        {:else if column.key === 'actions'}
          <div class="flex items-center justify-center gap-2">
            <button class="btn-icon" title={$_('list.edit_action')} on:click={() => handleEdit(item)}>
              <Icon name="edit" />
            </button>
            <button class="btn-icon btn-icon-danger" title={$_('list.delete_action')} on:click={() => handleDelete(item)}>
              <Icon name="x" />
            </button>
          </div>
        {:else}
          {item[column.key]}
        {/if}
      </div>
    </DataTable>
  </div>
</div>

<FieldEditorPanel
  isOpen={isPanelOpen}
  field={editingField}
  on:close={handlePanelClose}
/>

<ConfirmModal />

<style>
  .view-container { display: flex; flex-direction: column; height: 100%; }
  .view-content { flex-grow: 1; padding: 1.5rem 2rem; }
  .actions .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
    border: none;
    color: white;
    background-color: var(--accent-color);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .actions .btn-primary:hover { filter: brightness(1.1); }
  .mr-2 { margin-right: 0.5rem; }
  
  .monospace { font-family: var(--font-mono); background-color: var(--bg-hover); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; }
  .badge { display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 99px; color: var(--accent-color-dark); background-color: var(--accent-color-light); }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .gap-2 { gap: 0.5rem; }
  .btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.2s ease; }
  .btn-icon:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
  .btn-icon-danger:hover { color: #e53e3e; background-color: rgba(229, 62, 62, 0.1); }
</style>
