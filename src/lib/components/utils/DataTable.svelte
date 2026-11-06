<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { _ } from 'svelte-i18n';

  // --- Props ---
  export let items: any[];
  export let columns: { key: string; title: string; class?: string; sortable?: boolean }[];
  export let loading: boolean = false;
  export let error: string | null = null;
  export let searchTerm: string = '';
  export let searchPlaceholder: string = 'Search...';
  export let emptyMessage: string = 'No items found.';
  export let emptyIcon: string = 'info';

  // --- Internal State for Sorting & Pagination ---
  let sortKey = '';
  let sortDirection = 'asc'; // 'asc' or 'desc'
  let pageSize = 10;
  let currentPage = 1;
  const pageSizeOptions = [5, 10, 25, 50, 100];

  // --- Handlers ---
  function handleSort(key: string) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
    currentPage = 1; // Reset to first page on sort
  }

  function goToPreviousPage() {
    if (currentPage > 1) currentPage--;
  }

  function goToNextPage() {
    if (currentPage < totalPages) currentPage++;
  }
  
  // --- Reactive Derived State ---
  $: sortedItems = (() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  $: totalPages = Math.ceil(sortedItems.length / pageSize);

  $: paginatedItems = sortedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Reset to page 1 if filters/data change results in fewer pages
  $: if (currentPage > totalPages) {
      currentPage = totalPages || 1;
  }
</script>

<div class="datatable-wrapper">
  <div class="table-toolbar">
    <div class="search-container">
      <div class="search-icon">
        <Icon name="search" size={20}/>
      </div>
      <input 
        type="text" 
        placeholder={searchPlaceholder} 
        class="search-input"
        bind:value={searchTerm}
      />
    </div>
    <slot name="toolbar-actions"></slot>
  </div>
  
  <div class="table-container">
    {#if loading && items.length === 0}
      <div class="state-placeholder"><Icon name="loader" size={24} spinning={true} /><span>{$_('list.loading')}</span></div>
    {:else if error}
      <div class="state-placeholder error"><Icon name="alert-triangle" size={24} /><span>{error}</span></div>
    {:else if items.length === 0}
      <div class="state-placeholder"><Icon name={emptyIcon} size={24} /><span>{emptyMessage}</span></div>
    {:else}
      <table class="data-table">
        <thead class="table-header">
          <tr>
            {#each columns as column}
              <th class={column.class || ''}>
                {#if column.sortable}
                  <button class="sort-btn" on:click={() => handleSort(column.key)}>
                    {column.title}
                    {#if sortKey === column.key}
                      <Icon name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} />
                    {:else}
                      <Icon name="minus" size={14} class="sort-placeholder"/>
                    {/if}
                  </button>
                {:else}
                  {column.title}
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="table-body">
          {#each paginatedItems as item (item.id)}
            <tr class="table-row">
              {#each columns as column}
                <td class={column.class || ''}>
                  <slot name="cell" {item} {column}>
                    {item[column.key]}
                  </slot>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <div class="table-footer">
    <div class="page-size-selector">
      <label for="page-size">{$_('data_library.rows_per_page')}</label>
      <select id="page-size" bind:value={pageSize} class="form-input-sm">
        {#each pageSizeOptions as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>
    <div class="pagination-controls">
      <span>{$_('data_library.page_of', { values: { current: currentPage, total: totalPages } })}</span>
      <button class="btn-icon" on:click={goToPreviousPage} disabled={currentPage <= 1}>
        <Icon name="chevron-left" />
      </button>
      <button class="btn-icon" on:click={goToNextPage} disabled={currentPage >= totalPages}>
        <Icon name="chevron-right" />
      </button>
    </div>
  </div>
</div>

<style>
  .datatable-wrapper { display: flex; flex-direction: column; height: 100%; }
  .table-toolbar { margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
  .search-container { position: relative; width: 100%; max-width: 300px; }
  .table-container { flex-grow: 1; overflow-x: auto; border: 1px solid var(--border-color); border-radius: 12px; }
  .data-table { width: 100%; border-collapse: collapse; }
  .table-header th { padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); background-color: var(--bg-secondary); }
  .table-header th:first-child { border-top-left-radius: 12px; }
  .table-header th:last-child { border-top-right-radius: 12px; }
  .table-body tr { border-bottom: 1px solid var(--border-color); }
  .table-body tr:last-child { border-bottom: none; }
  .table-row td { padding: 1rem 1rem; vertical-align: middle; }
  .state-placeholder { display: flex; align-items: center; justify-content: center; flex-grow: 1; gap: 1rem; color: var(--text-secondary); padding: 2rem; }
  .state-placeholder.error { color: #c53030; }

  /* Sorting Styles */
  .sort-btn { background: none; border: none; cursor: pointer; font: inherit; color: inherit; display: flex; align-items: center; gap: 0.5rem; padding: 0; border-radius: 4px; }
  .sort-placeholder { color: transparent; }
  .sort-btn:hover .sort-placeholder { color: var(--text-secondary); }
  
  /* Footer Styles */
  .table-footer { display: flex; justify-content: flex-end; align-items: center; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-top: none; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-size: 0.875rem; color: var(--text-secondary); background-color: var(--bg-secondary); }
  .page-size-selector { display: flex; align-items: center; gap: 0.5rem; margin-right: 2rem; }
  .form-input-sm { font-size: 0.875rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.25rem 0.5rem; color: var(--text-primary); }
  .pagination-controls { display: flex; align-items: center; gap: 1rem; }
  .btn-icon { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.2s ease; }
  .btn-icon:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
  .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
  .text-center {text-align: center !important;}
</style>
