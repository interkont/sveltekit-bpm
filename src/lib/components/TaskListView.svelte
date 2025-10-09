<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { taskDetailStore } from '$lib/stores/taskDetailStore';
  import { taskListStore } from '$lib/stores/taskListStore';
  import type { Task } from '$lib/types';

  onMount(() => {
    // Fetch tasks when the component is first mounted
    taskListStore.fetchTasks();
  });
</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>Mis Tareas Pendientes</h2>
      <p>Aquí encontrarás todas las tareas que requieren tu atención.</p>
    </div>
    <button class="btn btn-secondary" on:click={taskListStore.fetchTasks} disabled={$taskListStore.loading}>
      <Icon name="loader" size={16} spinning={$taskListStore.loading} />
      <span>Refrescar</span>
    </button>
  </div>
  
  <div class="task-list-container">
    {#if $taskListStore.loading}
      <div class="state-placeholder">
        <Icon name="loader" size={24} spinning={true} />
        <span>Cargando tareas...</span>
      </div>
    {:else if $taskListStore.error}
      <div class="state-placeholder error">
        <Icon name="alert-triangle" size={24} />
        <span>Error al cargar tareas: {$taskListStore.error}</span>
      </div>
    {:else if $taskListStore.tasks.length === 0}
      <div class="state-placeholder">
        <Icon name="check-circle" size={24} />
        <span>¡Excelente! No tienes tareas pendientes.</span>
      </div>
    {:else}
      <div class="task-list">
        {#each $taskListStore.tasks as task (task.taskId)}
          <div class="task-card">
            <div class="task-info">
                <div class="task-icon">
                    <Icon name="edit" size={20}/>
                </div>
                <div>
                    <h3>{task.taskName}</h3>
                    <p class="process-description">{task.processDescription}</p>
                    <p class="process-meta">
                        <strong>Proceso:</strong> {task.processName} (V{task.processVersion}) - 
                        <strong>Instancia ID:</strong> {task.processInstanceId} - 
                        Iniciado por: {task.processStartedBy}
                    </p>
                </div>
            </div>
            <div class="task-actions">
              <button class="manage-btn" on:click={() => taskDetailStore.show(task)}>
                <Icon name="arrow-right-circle" size={16}/>
                Gestionar Tarea
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
/* ... (Existing styles remain largely the same, with additions for new states) ... */
.view-container { display: flex; flex-direction: column; gap: 1.5rem; }
.view-header { display: flex; justify-content: space-between; align-items: center; }
.view-header h2 { margin: 0; } .view-header p { margin: 0; color: var(--text-secondary); }

.task-list-container {
  min-height: 300px; /* Ensure container has a minimum height */
  display: flex;
  flex-direction: column;
}

.state-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
}
.state-placeholder.error {
  color: #c53030;
  background-color: #f5656520;
}

.task-list {
  display: grid;
  gap: 1rem;
}
.task-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease-in-out;
}
.task-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  border-left: 4px solid var(--accent-color);
  transform: translateX(2px);
}

.task-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.task-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ebf8ff;
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.task-info h3 { margin: 0 0 0.25rem 0; font-size: 1.125rem; }
.task-info p { margin: 0; font-size: 0.9rem; color: var(--text-secondary); }
.process-description { font-style: italic; margin-bottom: 0.5rem !important; }
.process-meta { font-size: 0.8rem !important; }

.manage-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--accent-color); color: white;
  border: none; padding: 0.75rem 1.25rem; border-radius: 8px;
  font-weight: 500; cursor: pointer; transition: opacity 0.2s;
}
.manage-btn:hover { opacity: 0.9; }

.btn { padding: 0.6rem 1.2rem; font-weight: 600; font-size: 0.9rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
.btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-tertiary); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
