<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher, onMount } from 'svelte';
    import { taskDetailStore } from '$lib/stores/taskDetailStore';
    import { taskListStore } from '$lib/stores/taskListStore';
    import { modal } from '$lib/stores/modal';
    import Icon from '$lib/components/Icon.svelte';
    import { taskService } from '$lib/services/taskService';
    import { toast } from '$lib/stores/toast';
    import type { Task, ProcessInstance, BusinessDataItem, GeneralInfoItem, TimelineStep, TimelineStatus, Comment, DocumentGroup, ProcessTaskInstance } from '$lib/types';

    let activeTab: 'form' | 'details' = 'form';
    let selectedAction: string = '';
    let comments: string = '';
    let formData: Record<string, any> = {}; // Renamed from businessData to be more specific
    let isSubmitting = false;

    // --- Reactive variables derived from the store state ---
    $: task = $taskDetailStore.task;
    $: processInstance = $taskDetailStore.processInstance;
    $: formDefinition = $taskDetailStore.formDefinition;
    $: generalInfo = processInstance ? mapGeneralInfo(processInstance) : [];
    $: timeline = processInstance ? mapTimeline(processInstance) : [];
    $: commentsData = processInstance ? mapComments(processInstance.taskInstances) : [];
    $: documentsData = [] as DocumentGroup[];
    // This variable is for displaying the read-only process data
    $: businessDataDisplay = processInstance ? mapBusinessData(processInstance.businessData) : [];


    // When the form definition loads, initialize the formData for editable fields
    $: if (formDefinition) {
      formData = {};
      formDefinition.fields.forEach(field => {
        // Only add non-readonly fields to the data we can submit
        if (!field.validations.isReadonly) {
          formData[field.name] = field.value ?? '';
        }
      });
      if (formDefinition.actions.length > 0) {
        selectedAction = formDefinition.actions[0];
      }
    }

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

    function mapTimeline(instance: ProcessInstance): TimelineStep[] {
        if (!instance?.taskInstances) return [];
        const sortedTasks = [...instance.taskInstances].sort((a, b) => b.id - a.id);
        const mappedSteps = sortedTasks.map(t => ({
            taskName: t.processElement.name,
            status: (t.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') as TimelineStatus,
            user: t.completedByUser?.fullName || 'N/A',
            date: t.completionTime ? new Date(t.completionTime).toLocaleString() : null,
        }));
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
  
    async function handleSubmit() {
        if (!task || !formDefinition) return;
        isSubmitting = true;
        try {
            const payload = {
                action: selectedAction,
                comments: comments,
                formData: formData
            };
            await taskService.completeTask(task.taskId, payload);
            toast.show(`Tarea "${task.taskName}" completada.`, 'success');
            taskDetailStore.hide();
            taskListStore.fetchTasks(); // Refresh the task list
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            toast.show(message, 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function confirmAndSubmit() {
        if (!task) return;
        modal.show({
            title: `Confirmar Acción: ${selectedAction}`,
            message: `¿Estás seguro de que deseas finalizar esta tarea?`,
            onConfirm: handleSubmit
        });
    }

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
            <div class="state-placeholder"><Icon name="loader" size={32} spinning={true} /><p>Cargando detalles...</p></div>
        {:else if $taskDetailStore.error}
            <div class="state-placeholder error"><Icon name="alert-triangle" size={32} /><p>Error al cargar: {$taskDetailStore.error}</p></div>
        {:else if processInstance && formDefinition}
            {#if activeTab === 'form'}
                <div class="form-content">
                    <!-- Columna Izquierda: Formulario Dinámico -->
                    <div class="dynamic-form">
                        <h3><Icon name="file-text" size={18}/> Formulario</h3>
                        {#each formDefinition.fields as field (field.name)}
                            <div class="form-field">
                                <label for={field.name}>
                                {field.label}
                                {#if field.validations.isRequired && !field.validations.isReadonly}<span class="required-star">*</span>{/if}
                                </label>
                                
                                {#if field.validations.isReadonly}
                                    <div class="value-box">{field.value}</div>
                                {:else if field.fieldType === 'NUMBER'}
                                    <input type="number" id={field.name} bind:value={formData[field.name]} required={field.validations.isRequired} />
                                {:else if field.fieldType === 'TEXTAREA'}
                                    <textarea id={field.name} rows="4" bind:value={formData[field.name]} required={field.validations.isRequired}></textarea>
                                {:else if field.fieldType === 'DATE'}
                                    <input type="date" id={field.name} bind:value={formData[field.name]} required={field.validations.isRequired} />
                                {:else}
                                    <input type="text" id={field.name} bind:value={formData[field.name]} required={field.validations.isRequired} />
                                {/if}
                            </div>
                        {/each}
                    </div>
                    
                    <!-- Columna Derecha: Acciones y Contexto -->
                    <div class="action-form">
                        <section class="info-section">
                            <h3><Icon name="info" size={16}/> Datos del Proceso</h3>
                            <div class="form-placeholder-details">
                                {#each businessDataDisplay as field}
                                <div class="form-field">
                                    <label>{field.label}</label>
                                    <div class="value-box">
                                    {field.value}
                                    </div>
                                </div>
                                {/each}
                            </div>
                        </section>

                        <div class="action-section">
                            <h3><Icon name="check-square" size={18}/> Finalizar Tarea</h3>
                            <div class="form-field">
                              <label for="action-select">Selecciona una acción</label>
                              <select id="action-select" bind:value={selectedAction}>
                                {#each formDefinition.actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                              </select>
                            </div>
                            <div class="form-field">
                              <label for="comments-textarea">Añadir observaciones (opcional)</label>
                              <textarea id="comments-textarea" rows="4" placeholder="Escribe tus comentarios aquí..." bind:value={comments}></textarea>
                            </div>
                            <div class="form-actions">
                              <button class="cancel-btn" on:click={taskDetailStore.hide}>Cancelar</button>
                              <button class="submit-btn" on:click={confirmAndSubmit} disabled={isSubmitting}>
                                {#if isSubmitting}
                                    <Icon name="loader" size={16} spinning={true} />
                                    <span>Procesando...</span>
                                {:else}
                                    Finalizar Tarea
                                {/if}
                                </button>
                            </div>
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
                                    {#each businessDataDisplay as field}
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
/* Estilos existentes */
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

/* Layout del formulario actualizado a 2 columnas */
.form-content {
    display: grid;
    grid-template-columns: 1fr 380px; /* Columna principal y columna de acciones/contexto */
    gap: 2rem;
    height: 100%;
}
.dynamic-form {
    background-color: var(--bg-primary);
    border-radius: 12px;
    overflow-y: auto;
    border-right: 1px solid var(--border-color);
    padding-right: 2rem;
}
.action-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.action-form h3, .dynamic-form h3 {
  display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1.5rem 0;
  font-size: 1.25rem; color: var(--text-primary); font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.form-field { margin-bottom: 1.5rem; }
.form-field label { display: block; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; }
.form-field select, .form-field textarea, .form-field input {
  width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
  background-color: var(--bg-secondary); color: var(--text-primary);
  border-radius: 8px; font-size: 1rem; box-sizing: border-box;
}
.form-field input:disabled, .form-field textarea:disabled, .value-box {
    background-color: var(--bg-hover);
    color: var(--text-secondary);
    cursor: not-allowed;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    white-space: pre-wrap; 
    word-wrap: break-word;
}
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: auto; padding-top: 1rem; }
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; display: flex; align-items: center; gap: 0.5rem; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.process-details-content { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: 100%; }
.left-column { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
.right-column-details { display: flex; flex-direction: column; min-width: 0; overflow-y: auto; }
.tab-content-details { display: flex; flex-direction: column; gap: 2rem; }
.info-section { background-color: var(--bg-secondary); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border-color); }
.form-placeholder-details { display: flex; flex-direction: column; gap: 1.5rem; }

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
.comments-section { display: flex; flex-direction: column; gap: 1.5rem; }
.no-data-placeholder { font-style: italic; color: var(--text-secondary); text-align: center; padding: 2rem; background-color: var(--bg-primary); border-radius: 8px; }
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
.required-star { color: #c53030; margin-left: 0.25rem; }
</style>
