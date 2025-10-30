<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { GridColumn } from '$lib/types';
	import { _ } from 'svelte-i18n';

	export let columns: GridColumn[];
	export let value: Record<string, any>[] = [];
	export let readonly = false;

	// Initialize with an empty array if the value is null or undefined
	$: if (value === null || value === undefined) {
		value = [];
	}

	function addRow() {
		const newRow = columns.reduce((acc, col) => {
			acc[col.name] = null;
			return acc;
		}, {} as Record<string, any>);
		value = [...value, newRow];
	}

	function removeRow(index: number) {
		value = value.filter((_, i) => i !== index);
	}

	// Helper to get options for a select column
	function getColumnOptions(columnName: string) {
		const column = columns.find(c => c.name === columnName);
		return column?.options || [];
	}
</script>

<div class="grid-container" class:readonly>
	{#if readonly}
		{#if !value || value.length === 0}
			<div class="no-data-grid">{$_('forms.grid.no_data')}</div>
		{:else}
			<table class="readonly-grid">
				<thead>
					<tr>
						{#each columns as col}
							<th>{col.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each value as row, i}
						<tr>
							{#each columns as col}
								<td>
									<!-- FIX: Display the label for SELECT type instead of the value -->
									{#if col.type === 'SELECT'}
										{getColumnOptions(col.name).find((opt: { value: any; }) => opt.value === row[col.name])?.label || row[col.name]}
									{:else}
										{row[col.name]}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{:else}
		<!-- Editable Grid -->
		<div class="table-wrapper">
			<table class="editable-grid">
				<thead>
					<tr>
						{#each columns as col}
							<th>{col.label}</th>
						{/each}
						<th class="action-col" aria-label={$_('forms.grid.actions_header')} />
					</tr>
				</thead>
				<tbody>
					{#if value.length === 0}
						<tr>
							<td colspan={columns.length + 1} class="no-rows-placeholder">
								{$_('forms.grid.empty_state')}
							</td>
						</tr>
					{/if}
					{#each value as row, rowIndex (rowIndex)}
						<tr>
							{#each columns as col (col.name)}
								<td class:select-cell={col.type === 'SELECT'}>
									{#if col.type === 'TEXT'}
										<input type="text" bind:value={row[col.name]} class="grid-input" />
									{:else if col.type === 'NUMBER'}
										<input type="number" bind:value={row[col.name]} class="grid-input" />
									{:else if col.type === 'DATE'}
										<input type="date" bind:value={row[col.name]} class="grid-input" />
									{:else if col.type === 'SELECT'}
										<select bind:value={row[col.name]} class="grid-input">
											<option value={null}>{$_('forms.select_placeholder')}</option>
											{#each col.options || [] as option}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									{/if}
								</td>
							{/each}
							<td class="action-col">
								<button type="button" class="btn-icon" on:click={() => removeRow(rowIndex)} title={$_('forms.grid.remove_row_tooltip')}>
									<Icon name="trash" size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<button type="button" on:click={addRow} class="btn-add-row">
			<Icon name="plus" size={16} />
			<span>{$_('forms.grid.add_row_button')}</span>
		</button>
	{/if}
</div>

<style>
	.grid-container {
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1rem;
		background-color: var(--bg-primary);
	}
    .grid-container.readonly {
        background-color: transparent;
        border: none;
        padding: 0;
    }
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border-color-light);
		border-radius: 8px;
	}
	.editable-grid, .readonly-grid {
		width: 100%;
		border-collapse: collapse;
		white-space: nowrap;
	}
	.editable-grid th, .editable-grid td,
    .readonly-grid th, .readonly-grid td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border-color-light);
	}
	.editable-grid tr:last-child td,
	.readonly-grid tr:last-child td {
		border-bottom: none;
	}
	.editable-grid th, .readonly-grid th {
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--text-secondary);
		background-color: var(--bg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
    .readonly-grid td {
        color: var(--text-primary);
        vertical-align: top;
		font-size: 0.95rem;
    }
	.grid-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		border-radius: 8px;
		font-size: 1rem;
		box-sizing: border-box;
		min-height: 44px; /* Unify height */
		min-width: 150px;
	}
	/* Give SELECTs more horizontal space */
	.select-cell {
		min-width: 250px;
	}
	.action-col {
		width: 50px;
		min-width: 50px;
		text-align: center;
		padding: 0.5rem;
	}
	.btn-icon {
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		transition: all 0.2s ease;
	}
	.btn-icon:hover {
		color: var(--accent-color-dark);
		background-color: var(--bg-hover);
	}
	.btn-add-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		background-color: transparent;
		color: var(--accent-color);
		border: 1px solid var(--accent-color-light);
		padding: 0.6rem 1.2rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.btn-add-row:hover {
		background-color: var(--accent-color-light);
		border-color: var(--accent-color);
	}
    .no-data-grid, .no-rows-placeholder {
        color: var(--text-secondary);
        font-style: italic;
        padding: 2rem 1rem;
        text-align: center;
        background-color: var(--bg-secondary);
        border-radius: 8px;
    }
	.no-rows-placeholder {
		background-color: transparent;
	}
	select {height: 51px;}
</style>
