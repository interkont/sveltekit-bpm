<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import Icon from '$lib/components/Icon.svelte';
  import { processDetailStore } from '$lib/stores/processDetailStore';
  import { processListStore } from '$lib/stores/processListStore';
  import type { ProcessInstance } from '$lib/types';

  const dispatch = createEventDispatcher();

  let activeTab: 'running' | 'historical' = 'running';

  onMount(() => {
    processListStore.fetchInstances();
  });

  // Reactive statements to filter instances based on the active tab and store data
  $: runningProcesses = $processListStore.instances.filter(p => p.status.toUpperCase() === 'RUNNING');
  $: historicalProcesses = $processListStore.instances.filter(p => p.status.toUpperCase() !== 'RUNNING');
  $: processes = activeTab === 'running' ? runningProcesses : historicalProcesses;

  function setTab(tab: 'running' | 'historical') {
    activeTab = tab;
  }
  
  function handleShowDetail(processId: number) {
    processDetailStore.show(processId);
  }
</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>{$_('process_list.title')}</h2>
      <p>{$_('process_list.description')}</p>
    </div>
    <button class="create-btn" on:click={() => dispatch('navigate', { view: 'new-process' })}>
      <Icon name="plus" size={20}/>
      {$_('process_list.create_button')}
    </button>
  </div>

  <div class="tabs">
    <button class:active={activeTab === 'running'} on:click={() => setTab('running')}>
      {$_('process_list.running_tab')} ({runningProcesses.length})
    </button>
    <button class:active={activeTab === 'historical'} on:click={() => setTab('historical')}>
      {$_('process_list.historical_tab')} ({historicalProcesses.length})
    </button>
  </div>

  <div class="process-list-container">
    {#if $processListStore.loading}
      <div class="state-placeholder">
        <Icon name="loader" size={24} spinning={true} />
        <span>{$_('process_list.loading')}</span>
      </div>
    {:else if $processListStore.error}
      <div class="state-placeholder error">
        <Icon name="alert-triangle" size={24} />
        <span>{$_('process_list.error')}: {$processListStore.error}</span>
      </div>
    {:else if processes.length === 0}
      <div class="state-placeholder">
        <Icon name="inbox" size={24} />
        <span>{$_('process_list.empty')}</span>
      </div>
    {:else}
      <div class="process-list">
        {#each processes as process (process.id)}
          <div class="process-card">
            <div class="process-info">
              <div class="process-icon"><Icon name="cpu" size={24}/></div>
              <div>
                <h3 class="process-name">{process.processDefinition.name} (ID: {process.id})</h3>
                <p class="process-description">{process.description}</p>
                <span class="process-meta">{$_('process_list.started_by')} <strong>{process.startedByUser.fullName}</strong> {$_('process_list.on')} {new Date(process.startTime).toLocaleDateString()}</span>
              </div>
            </div>
            <div class="process-status">
              <span>{process.status}</span>
            </div>
            <div class="process-actions">
              <button class="details-btn" on:click={() => handleShowDetail(process.id)}>
                <Icon name="eye" size={16}/> {$_('process_list.view_details_button')}
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
/* ... Estilos existentes ... */
.view-container { display: flex; flex-direction: column; gap: 1.5rem; }
.view-header { display: flex; justify-content: space-between; align-items: center; }
.view-header h2 { margin: 0; } .view-header p { margin: 0; color: var(--text-secondary); }
.create-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--accent-color); color: white;
  border: none; padding: 0.75rem 1.25rem; border-radius: 8px;
  font-weight: 500; cursor: pointer; transition: opacity 0.2s;
}
.create-btn:hover { opacity: 0.9; }

.tabs { display: flex; border-bottom: 2px solid var(--border-color); }
.tabs button {
  background: none; border: none; padding: 0.75rem 1.5rem; font-size: 1rem;
  font-weight: 500; cursor: pointer; color: var(--text-secondary);
  border-bottom: 2px solid transparent; transform: translateY(2px);
}
.tabs button.active { color: var(--accent-color); border-color: var(--accent-color); }

.process-list-container { min-height: 300px; display: flex; flex-direction: column; }
.state-placeholder {
  display: flex; align-items: center; justify-content: center;
  flex-grow: 1; gap: 1rem; color: var(--text-secondary);
  border: 2px dashed var(--border-color); border-radius: 12px;
}
.state-placeholder.error { color: #c53030; background-color: #f5656520; }

.process-list { display: grid; gap: 1rem; }
.process-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center; gap: 1rem;
  background-color: var(--bg-secondary); border: 1px solid var(--border-color);
  padding: 1.25rem; border-radius: 8px;
  transition: box-shadow 0.2s;
}
.process-card:hover { box-shadow: 0 4px 10px -1px rgba(0,0,0,0.05); }

.process-info { display: flex; align-items: center; gap: 1rem; }
.process-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background-color: var(--accent-color-light, #ebf4ff); color: var(--accent-color);
  display: flex; align-items: center; justify-content: center;
}
.process-name { font-size: 1.125rem; margin: 0 0 0.25rem 0; }
.process-description { font-size: 0.9rem; color: var(--text-secondary); margin: 0 0 0.5rem 0; font-style: italic; }
.process-meta { font-size: 0.8rem; color: var(--text-secondary); }
.process-status span {
  background-color: #e6fffa; color: #234e52;
  padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 500;
  white-space: nowrap;
}
.details-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--bg-secondary); color: var(--text-primary);
  border: 1px solid var(--border-color); padding: 0.6rem 1rem;
  border-radius: 6px; font-weight: 500; cursor: pointer;
}
.details-btn:hover { background-color: var(--bg-hover); }
</style>
