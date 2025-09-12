<script lang="ts">
  // --- AJUSTE: Se actualizan las rutas de importación ---
  import Icon from '$lib/components/Icon.svelte';
  import { tooltip } from '$lib/actions/tooltip';
  import { taskDetailStore } from '$lib/stores/taskDetailStore';
  // --- AJUSTE: Importamos el tipo de dato para una Tarea ---
  import type { Task } from '$lib/types';

  // --- AJUSTE: Se aplica el tipo 'Task[]' a nuestro array de datos de maqueta ---
  let tasks: Task[] = [
    {
      id: 'TSK-001', processName: 'Solicitud de Compra #456', taskName: 'Aprobar Solicitud de Gerencia',
      process: { id: 'PROC-001', processName: 'Solicitud de Compra #456', initiator: 'Ana Martínez', creationDate: '2023-10-27', status: 'En Finanzas' }
    },
    {
      id: 'TSK-002', processName: 'Reembolso de Gastos #122', taskName: 'Revisar Facturas de Viaje',
      process: { id: 'PROC-002', processName: 'Reembolso de Gastos #122', initiator: 'Juan Pérez', creationDate: '2023-10-26', status: 'En Gerencia' }
    },
    {
      id: 'TSK-003', processName: 'Solicitud de Vacaciones', taskName: 'Validar Calendario de Equipo',
      process: { id: 'PROC-003', processName: 'Solicitud de Vacaciones', initiator: 'Sofía Loren', creationDate: '2023-10-25', status: 'En Aprobación' }
    }
  ];

  // --- AJUSTE: Se tipa el parámetro 'task' de la función ---
  function handleManageTask(task: Task) {
    taskDetailStore.show(task); // Llamar al nuevo panel
  }
</script>

<div class="view-container">
  <div class="view-header">
    <div>
      <h2>Mis Tareas Pendientes</h2>
      <p>Aquí encontrarás todas las tareas que requieren tu atención.</p>
    </div>
  </div>
  
  <div class="task-list">
    {#each tasks as task (task.id)}
      <div class="task-card">
        <div class="task-info">
            <div class="task-icon">
                <Icon name="edit" size={20}/>
            </div>
            <div>
                <h3>{task.taskName}</h3>
                <p><strong>Proceso:</strong> {task.processName}</p>
            </div>
        </div>
        <div class="task-actions">
          <button class="manage-btn" on:click={() => handleManageTask(task)} use:tooltip={'Gestionar esta tarea'}>
            <Icon name="arrow-right-circle" size={16}/>
            Gestionar Tarea
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
/* ... (Los estilos de TaskListView se mantienen similares, ajustados para el nuevo botón) ... */
.view-container { display: flex; flex-direction: column; gap: 1.5rem; }
.view-header h2 { margin: 0; } .view-header p { margin: 0; color: var(--text-secondary); }

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

.manage-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--accent-color); color: white;
  border: none; padding: 0.75rem 1.25rem; border-radius: 8px;
  font-weight: 500; cursor: pointer; transition: opacity 0.2s;
}
.manage-btn:hover { opacity: 0.9; }
</style>