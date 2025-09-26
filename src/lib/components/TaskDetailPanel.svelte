<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
    import { taskDetailStore } from '$lib/stores/taskDetailStore';
    import { modal } from '$lib/stores/modal';
    import Icon from '$lib/components/Icon.svelte';
    import type { Task, ProcessInstance, BusinessDataItem, GeneralInfoItem, TimelineStep, TimelineStatus, Comment, DocumentGroup, ProcessTaskInstance } from '$lib/types';

    const dispatch = createEventDispatcher<{
      submit: { task: Task; action: string; comments: string };
    }>();

    let activeTab: 'form' | 'details' = 'form';
    let selectedAction: 'approve' | 'reject' | 'request-info' = 'approve';
    let comments: string = '';
    
    // --- Reactive variables derived from the store state ---
    $: task = $taskDetailStore.task;
    $: processInstance = $taskDetailStore.processInstance;
    $: generalInfo = processInstance ? mapGeneralInfo(processInstance) : [];
    $: businessData = processInstance ? mapBusinessData(processInstance.businessData) : [];
    $: timeline = processInstance ? mapTimeline(processInstance) : [];
    $: commentsData = processInstance ? mapComments(processInstance.taskInstances) : [];
    $: documentsData = [] as DocumentGroup[]; // Placeholder for future use

    // --- Helper functions to transform API data to UI format ---
    function mapGeneralInfo(instance: ProcessInstance): GeneralInfoItem[] {
        return [
            { label: 'Solicitado por', value: instance.startedByUser.fullName, icon: 'user' },
            { label: 'Correo del Solicitante', value: instance.startedByUser.email, icon: 'at-sign' },
            { label: 'Fecha de Inicio', value: new Date(instance.startTime).toLocaleString(), icon: 'calendar' },
            { label: 'Estado del Proceso', value: instance.status, icon: 'activity' },
        ];
    }

    function mapBusinessData(data: Record<string, any>): BusinessDataItem[] {
        if (!data) return [];
        return Object.entries(data).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: String(value)
        }));
    }

    // Maps task instances from the API to the timeline format required by the UI
    function mapTimeline(instance: ProcessInstance): TimelineStep[] {
        if (!instance?.taskInstances) return [];

        // 1. Sort task instances by ID descending
        const sortedTasks = [...instance.taskInstances].sort((a, b) => b.id - a.id);

        // 2. Map sorted tasks to the UI format, using the correct name field
        const mappedSteps = sortedTasks.map(t => ({
            taskName: t.processElement.name, // <-- Using correct name field
            status: (t.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') as TimelineStatus,
            user: t.completedByUser?.fullName || 'N/A',
            date: t.completionTime ? new Date(t.completionTime).toLocaleString() : null,
        }));
        
        // 3. Add the start event to the end of the list
        mappedSteps.push({
          taskName: 'Inicio de Proceso',
          status: 'COMPLETED',
          user: instance.startedByUser.fullName,
          date: new Date(instance.startTime).toLocaleString()
        });

        return mappedSteps;
    }
    
    function mapComments(tasks: ProcessTaskInstance[]): Comment[] {
        if (!tasks) return [];
        
        return tasks
            .filter(task => typeof task.comments === 'string' && task.comments.trim() !== '')
            .map(task => ({
                user: task.completedByUser?.fullName || 'Usuario del Sistema',
                text: task.comments || '',
                date: new Date(task.completionTime || task.createdAt).toLocaleString(),
                avatar: (task.completedByUser?.fullName || 'SYS').substring(0, 2).toUpperCase()
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  
    function handleSubmit() {
        if (!task) return;
        const actionTextMap = { approve: 'Aprobar', reject: 'Rechazar', 'request-info': 'Solicitar más información' };
        const readableAction = actionTextMap[selectedAction] || selectedAction;

        modal.show({
            title: `Confirmar Acción: ${readableAction}`,
            message: `¿Estás seguro de que deseas finalizar esta tarea con la acción "${readableAction}"?`,
            onConfirm: () => {
                dispatch('submit', { task: task!, action: selectedAction, comments: comments });
            }
        });
    }

    // --- Logic for Timeline display ---
    $: executedTimeline = timeline.filter(step => step.status === 'COMPLETED' || step.status === 'IN_PROGRESS');
    $: totalSteps = timeline.length;
    $: currentStepNumber = executedTimeline.length;

    function getStatusIcon(status: TimelineStatus): { name: string; color: string } {
        if (status === 'COMPLETED') return { name: 'check-circle', color: 'var(--success-color)' };
        if (status === 'IN_PROGRESS') return { name: 'loader', color: 'var(--accent-color)' };
        return { name: 'circle', color: 'var(--text-secondary)' };
    }
</script>

{#if $taskDetailStore.isOpen}
  <div class="panel-backdrop" on:click={taskDetailStore.hide}></div>
  
  <aside class="detail-panel task-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      {#if task}
        <div>
          <span class="header-subtitle">Gestionando Tarea</span>
          <h2 title={task.taskName}>{task.taskName}</h2>
          <p>del Proceso: {task.processName}</p>
        </div>
      {/if}
      <button class="close-btn" on:click={taskDetailStore.hide} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </header>

    <div class="tab-header-tasks">
      <button class:active={activeTab === 'form'} on:click={() => activeTab = 'form'}>
        <Icon name="edit-3" size={16}/> Formulario de Tarea
      </button>
      <button class:active={activeTab === 'details'} on:click={() => activeTab = 'details'}>
        <Icon name="file-search" size={16}/> Detalles del Proceso
      </button>
    </div>

    <div class="panel-content-full">
        {#if $taskDetailStore.loading}
            <div class="state-placeholder">
                <Icon name="loader" size={32} spinning={true} />
                <p>Cargando detalles del proceso...</p>
            </div>
        {:else if $taskDetailStore.error}
            <div class="state-placeholder error">
                <Icon name="alert-triangle" size={32} />
                <p>Error al cargar: {$taskDetailStore.error}</p>
            </div>
        {:else if processInstance}
            {#if activeTab === 'form'}
                <div class="form-content">
                    <div class="form-placeholder">
                        <p class="placeholder-text">El formulario dinámico para la tarea "{task?.taskName}" se implementará aquí.</p>
                    </div>
                    <div class="action-form">
                        <h3><Icon name="check-square" size={18}/> Finalizar Tarea</h3>
                        <div class="form-field">
                          <label for="action-select">Selecciona una acción</label>
                          <select id="action-select" bind:value={selectedAction}>
                            <option value="approve">Aprobar</option>
                            <option value="reject">Rechazar</option>
                            <option value="request-info">Solicitar más información</option>
                          </select>
                        </div>
                        <div class="form-field">
                          <label for="comments-textarea">Añadir observaciones (opcional)</label>
                          <textarea id="comments-textarea" rows="4" placeholder="Escribe tus comentarios aquí..." bind:value={comments}></textarea>
                        </div>
                        <div class="form-actions">
                          <button class="cancel-btn" on:click={taskDetailStore.hide}>Cancelar</button>
                          <button class="submit-btn" on:click={handleSubmit}>Finalizar Tarea</button>
                        </div>
                    </div>
                </div>
            {:else if activeTab === 'details'}
                <div class="process-details-content">
                    <div class="left-column">
                        <section class="info-section">
                            <h3><Icon name="info" size={16}/> Información General</h3>
                            <ul class="data-list">
                                {#each generalInfo as item}
                                <li>
                                    <Icon name={item.icon} size={16} class="data-icon"/>
                                    <div>
                                    <span class="label">{item.label}</span>
                                    <span class="value">{item.value}</span>
                                    </div>
                                </li>
                                {/each}
                            </ul>
                        </section>
                        <section class="info-section">
                            <div class="timeline-header">
                                <h3><Icon name="git-commit" size={18}/> Trazabilidad</h3>
                                {#if timeline.length > 0}
                                <span class="progress-indicator">Paso {currentStepNumber} de {totalSteps}</span>
                                {/if}
                            </div>
                            <div class="timeline">
                                {#each timeline as step, i (step.taskName + i)}
                                <div class="timeline-item status-{step.status.toLowerCase()}">
                                    <div class="timeline-connector">
                                    <div class="timeline-icon">
                                        <Icon name={getStatusIcon(step.status).name} size={16} color={getStatusIcon(step.status).color} />
                                    </div>
                                    {#if i < timeline.length - 1}
                                        <div class="timeline-line"></div>
                                    {/if}
                                    </div>
                                    <div class="timeline-content">
                                    <p class="task-name">{step.taskName}</p>
                                    {#if step.status === 'COMPLETED'}
                                        <span class="user-info">Completado por <strong>{step.user}</strong> el {step.date}</span>
                                    {:else if step.status === 'IN_PROGRESS'}
                                        <span class="user-info">Tarea actual asignada a <strong>{step.user}</strong></span>
                                    {/if}
                                    </div>
                                </div>
                                {/each}
                            </div>
                        </section>
                    </div>
                    <div class="right-column-details">
                        <div class="tab-content-details">
                            <section class="info-section">
                                <h3><Icon name="file-text" size={16}/> Datos del Proceso</h3>
                                <div class="form-placeholder-details">
                                    {#each businessData as field}
                                    <div class="form-field">
                                        <label>{field.label}</label>
                                        <div class="value-box">
                                        {field.value}
                                        </div>
                                    </div>
                                    {/each}
                                </div>
                            </section>
                            <section class="info-section">
                                <h3><Icon name="message-square" size={16}/> Observaciones</h3>
                                 <div class="comments-section">
                                    {#if commentsData.length > 0}
                                        {#each commentsData as comment}
                                            <div class="comment-bubble">
                                                <div class="comment-avatar">{comment.avatar}</div>
                                                <div class="comment-content">
                                                    <div class="comment-header">
                                                    <strong>{comment.user}</strong>
                                                    <span>{comment.date}</span>
                                                    </div>
                                                    <p>{comment.text}</p>
                                                </div>
                                            </div>
                                        {/each}
                                    {:else}
                                        <p class="no-data-placeholder">No hay observaciones registradas.</p>
                                    {/if}
                                </div>
                            </section>
                             <section class="info-section">
                                <h3><Icon name="paperclip" size={16}/> Documentos</h3>
                                 <div class="documents-section">
                                    {#if documentsData.length > 0}
                                        {#each documentsData as docGroup}
                                            <!-- Document rendering will go here -->
                                        {/each}
                                    {:else}
                                        <p class="no-data-placeholder">No hay documentos adjuntos.</p>
                                    {/if}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
  </aside>
{/if}

<style>
/* Estilos sin cambios */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1050;
}
.state-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 1rem; color: var(--text-secondary); text-align: center;
}
.state-placeholder.error { color: #c53030; }
.detail-panel.task-panel {
  width: 85vw; max-width: 1400px;
  background-color: var(--bg-primary);
  z-index: 1051;
  position: fixed; top: 0; right: 0; height: 100vh;
  box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);
  flex-shrink: 0; background-color: var(--bg-secondary);
}
.header-subtitle {
  font-size: 0.9rem; color: var(--accent-color); font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.panel-header h2 { margin: 0.25rem 0; color: var(--text-primary); font-size: 1.75rem; }
.panel-header p { margin: 0; color: var(--text-secondary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }

.tab-header-tasks { 
    display: flex; border-bottom: 1px solid var(--border-color); 
    padding: 0 2rem; flex-shrink: 0; background-color: var(--bg-secondary);
}
.tab-header-tasks button {
  display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
  padding: 1rem; font-size: 1rem; font-weight: 500; cursor: pointer;
  color: var(--text-secondary); position: relative;
  border-bottom: 3px solid transparent;
}
.tab-header-tasks button.active { color: var(--accent-color); border-color: var(--accent-color); }
.tab-header-tasks button:hover { color: var(--text-primary); }

.panel-content-full { flex-grow: 1; overflow-y: auto; padding: 2rem; }

.form-content { display: flex; flex-direction: column; height: 100%; }
.form-placeholder {
  border: 2px dashed var(--border-color); border-radius: 12px;
  padding: 2rem; text-align: center; flex-grow: 1;
  display: flex; align-items: center; justify-content: center;
}
.placeholder-text { color: var(--text-secondary); }
.action-form {
  margin-top: 2rem; padding-top: 2rem;
  border-top: 1px solid var(--border-color); flex-shrink: 0;
}
.action-form h3, .info-section h3 {
  display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem 0;
  font-size: 1.1rem; color: var(--text-primary); font-weight: 600;
}
.form-field { margin-bottom: 1rem; }
.form-field label { display: block; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; }
.form-field select, .form-field textarea {
  width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
  background-color: var(--bg-secondary); color: var(--text-primary);
  border-radius: 8px; font-size: 1rem; box-sizing: border-box;
}
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; }

.process-details-content { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: 100%; }
.left-column { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
.right-column-details { display: flex; flex-direction: column; min-width: 0; overflow-y: auto; }
.tab-content-details { display: flex; flex-direction: column; gap: 2rem; }
.info-section { background-color: var(--bg-secondary); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border-color); }
.form-placeholder-details { display: flex; flex-direction: column; gap: 1.5rem; }
.value-box { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; color: var(--text-secondary); white-space: pre-wrap; word-wrap: break-word; }

.data-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.data-list li { display: flex; align-items: flex-start; gap: 0.75rem; }
.data-icon { color: var(--accent-color); margin-top: 3px; }
.data-list .label { display: block; font-size: 0.85rem; color: var(--text-secondary); }
.data-list .value { font-weight: 500; color: var(--text-primary); }
.timeline-header { display: flex; justify-content: space-between; align-items: center; }
.timeline-header h3 { margin: 0; }
.progress-indicator { font-size: 0.85rem; font-weight: 500; background-color: var(--bg-hover); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 99px; }
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; position: relative; }
.timeline-connector { display: flex; flex-direction: column; align-items: center; margin-right: 1rem; }
.timeline-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid var(--border-color); background-color: var(--bg-secondary); z-index: 1; }
.timeline-line { flex-grow: 1; width: 2px; background-color: var(--border-color); }
.status-in_progress .timeline-icon { border-color: var(--accent-color); }
.status-completed .timeline-icon { border-color: var(--success-color); background-color: var(--success-color); color: white !important; }
.timeline-content { padding-bottom: 2rem; }
.task-name { font-weight: 600; margin: 0.5rem 0 0.25rem; }
.user-info { font-size: 0.85rem; color: var(--text-secondary); }
.status-in_progress .task-name { color: var(--accent-color); }
.comments-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.no-data-placeholder {
    font-style: italic;
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-primary);
    border-radius: 8px;
}
.comment-bubble { display: flex; gap: 1rem; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; background-color: var(--accent-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.comment-content { background-color: var(--bg-primary); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); width: 100%; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.comment-header span { font-size: 0.8rem; color: var(--text-secondary); }
.comment-content p { margin: 0; }
.documents-section h4 { color: var(--text-primary); margin: 0 0 1rem 0; }
.file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.file-list li { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-primary); }
.file-icon { color: var(--text-secondary); }
.file-info { flex-grow: 1; }
.file-name { color: var(--accent-color); text-decoration: none; font-weight: 500; }
.file-name:hover { text-decoration: underline; }
.file-meta { display: block; font-size: 0.8rem; color: var(--text-secondary); }
.download-btn { color: var(--text-secondary); }
.download-btn:hover { color: var(--accent-color); }
</style>
