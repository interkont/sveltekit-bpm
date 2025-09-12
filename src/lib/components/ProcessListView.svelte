<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  // --- AJUSTE: Se actualizan las rutas de importación ---
  import Icon from '$lib/components/Icon.svelte';
  import { processDetailStore } from '$lib/stores/processDetailStore';
  // --- AJUSTE: Importamos el tipo de dato para una instancia de proceso ---
  import type { ProcessInstance } from '$lib/types';

  const dispatch = createEventDispatcher();

  // --- AJUSTE: Se tipa la variable para que solo acepte los valores de las pestañas ---
  let activeTab: 'running' | 'historical' = 'running';

  // --- AJUSTE: Se aplica el tipo 'ProcessInstance[]' a los arrays de datos ---
  const runningProcesses: ProcessInstance[] = [
    { id: 'PROC-001', processName: 'Solicitud de Compra #456', initiator: 'Ana Martínez', creationDate: '2023-10-27', status: 'En Finanzas' },
    { id: 'PROC-002', processName: 'Reembolso de Gastos #122', initiator: 'Juan Pérez', creationDate: '2023-10-26', status: 'En Gerencia' }
  ];
  const historicalProcesses: ProcessInstance[] = [
    { id: 'PROC-000', processName: 'Contratación de Personal #99', initiator: 'RRHH', creationDate: '2023-09-15', status: 'Finalizado' }
  ];

  // TypeScript infiere que 'processes' también es de tipo 'ProcessInstance[]'
  let processes = runningProcesses;

  // --- AJUSTE: Se tipa el parámetro de la función ---
  function setTab(tab: 'running' | 'historical') {
    activeTab = tab;
    processes = tab === 'running' ? runningProcesses : historicalProcesses;
  }
  
  // --- AJUSTE: Se tipa el parámetro de la función ---
  function handleShowDetail(process: ProcessInstance) {
    processDetailStore.show(process);
  }
</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>Lista de Procesos</h2>
      <p>Supervisa todas las instancias de procesos activas e históricas.</p>
    </div>
    <button class="create-btn" on:click={() => dispatch('navigate', { view: 'new-process' })}>
      <Icon name="plus" size={20}/>
      Crear nueva solicitud
    </button>
  </div>

  <div class="tabs">
    <button class:active={activeTab === 'running'} on:click={() => setTab('running')}>En Ejecución</button>
    <button class:active={activeTab === 'historical'} on:click={() => setTab('historical')}>Históricos</button>
  </div>

  <div class="process-list">
    {#each processes as process (process.id)}
      <div class="process-card">
        <div class="process-info">
          <div class="process-icon"><Icon name="cpu" size={24}/></div>
          <div>
            <h3 class="process-name">{process.processName}</h3>
            <span class="process-meta">Iniciado por <strong>{process.initiator}</strong> el {process.creationDate}</span>
          </div>
        </div>
        <div class="process-status">
          <span>{process.status}</span>
        </div>
        <div class="process-actions">
          <button class="details-btn" on:click={() => handleShowDetail(process)}>
            <Icon name="eye" size={16}/> Ver Detalle
          </button>
        </div>
      </div>
    {/each}
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
  background-color: var(--accent-color-light, #ebf8ff); color: var(--accent-color);
  display: flex; align-items: center; justify-content: center;
}
.process-name { font-size: 1.125rem; margin: 0; }
.process-meta { font-size: 0.9rem; color: var(--text-secondary); }
.process-status span {
  background-color: #e6fffa; color: #234e52;
  padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 500;
}
.details-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--bg-secondary); color: var(--text-primary);
  border: 1px solid var(--border-color); padding: 0.6rem 1rem;
  border-radius: 6px; font-weight: 500; cursor: pointer;
}
.details-btn:hover { background-color: var(--bg-hover); }
</style>