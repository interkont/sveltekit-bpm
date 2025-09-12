<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
    // --- AJUSTE: Se actualizan las rutas de importación ---
    import { taskDetailStore } from '$lib/stores/taskDetailStore';
    import { modal } from '$lib/stores/modal';
    import Icon from '$lib/components/Icon.svelte';

    // --- AJUSTE: Importamos todos los tipos necesarios ---
    import type { Task, ProcessMockData, TimelineStep, TimelineStatus, PreviousTaskContext } from '$lib/types';

    // --- AJUSTE: Se define el "contrato" para los eventos que emite el componente ---
    const dispatch = createEventDispatcher<{
      submit: { task: Task; action: string; comments: string };
    }>();

    // --- AJUSTE: Se tipan las variables de estado ---
    let activeTab: 'form' | 'details' = 'form';
    let selectedAction: 'approve' | 'reject' | 'request-info' = 'approve';
    let comments: string = '';
    
    // La tarea puede ser de tipo Task o indefinida al inicio
    let task: Task | undefined;  
    
    taskDetailStore.subscribe(store => {
    if (store.task) {
      task = store.task;
      selectedAction = 'approve';
      comments = '';
      activeTab = 'form';
    }
  });

  // --- AJUSTE: Se aplica el tipo a la constante ---
  const previousTaskContext: PreviousTaskContext = {
    name: 'Aprobación de Gerente',
    user: 'Carlos Vega',
    comment: 'El monto parece razonable. Aprobado por mi parte. Por favor, revisar presupuesto con el centro de costos.'
  };
  
  function handleSubmit() {
    const actionTextMap = {
      approve: 'Aprobar',
      reject: 'Rechazar',
      'request-info': 'Solicitar más información'
    };
    const readableAction = actionTextMap[selectedAction] || selectedAction;

    modal.show({
      title: `Confirmar Acción: ${readableAction}`,
      message: `¿Estás seguro de que deseas finalizar esta tarea con la acción "${readableAction}"? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        // --- CAMBIO CLAVE AQUÍ ---
        // Ahora enviamos el objeto 'task' completo en el evento.
        dispatch('submit', {
          task: task!,
          action: selectedAction,
          comments: comments,
        });
      }
    });
  }

  // Simulación de los datos detallados del proceso
  const mockProcessData: ProcessMockData = {
    generalInfo: [
      { label: 'Solicitado por', value: 'Ana Martínez', icon: 'user' },
      { label: 'Rol del Solicitante', value: 'Desarrollador Senior', icon: 'shield' },
      { label: 'Fecha de Solicitud', value: '27 de Octubre, 2023', icon: 'calendar' },
      { label: 'Dependencia', value: 'Tecnología', icon: 'briefcase' },
    ],
    businessData: [ 
      { label: 'Nombre Completo del Solicitante', value: 'Ana Cecilia Martínez Rojas' },
      { label: 'Centro de Costos', value: 'FIN-TECH-2023-Q4' },
      { label: 'Razón de la Compra', value: 'Renovación anual de licencias de software para el equipo de desarrollo. Incluye licencias para IDEs, herramientas de testing y software de gestión de proyectos.' },
    ],
    timeline: [
      { taskName: 'Inicio de Solicitud', status: 'COMPLETED', user: 'Ana Martínez', date: '2023-10-27 14:30' },
      { taskName: 'Aprobación de Gerente', status: 'COMPLETED', user: 'Carlos Vega', date: '2023-10-28 10:15' },
      { taskName: 'Revisión de Finanzas', status: 'IN_PROGRESS', user: 'Sofía Loren', date: null },
      { taskName: 'Creación de Orden de Compra', status: 'PENDING', user: 'N/A', date: null },
    ],
    comments: [
        { user: 'Ana Martínez', text: 'Adjunto la cotización inicial del proveedor.', date: '2023-10-27 14:30', avatar: 'AM' },
        { user: 'Carlos Vega', text: 'El monto parece razonable. Aprobado por mi parte. Por favor, revisar presupuesto.', date: '2023-10-28 10:15', avatar: 'CV' },
    ],
    documents: [
      { taskName: 'Inicio de Solicitud', files: [{ name: 'Cotizacion_TechSolutions.pdf', type: 'pdf', date: '2023-10-27', user: 'Ana Martínez' }] },
    ]
  };
  
  // TypeScript infiere los tipos de las siguientes constantes
  const executedTimeline = mockProcessData.timeline.filter(
    (step: TimelineStep) => step.status === 'COMPLETED' || step.status === 'IN_PROGRESS'
  );
  const descendingExecutedTimeline = executedTimeline.slice().reverse();
  const totalSteps = mockProcessData.timeline.length;
  const currentStepNumber = executedTimeline.length;

  // --- AJUSTE: Se tipa el parámetro y el valor de retorno de la función ---
  function getStatusIcon(status: TimelineStatus): { name: string; color: string } {
    if (status === 'COMPLETED') return { name: 'check-circle', color: 'var(--success-color)' };
    if (status === 'IN_PROGRESS') return { name: 'loader', color: 'var(--accent-color)' };
    return { name: 'circle', color: 'var(--text-secondary)' };
  }
</script>

{#if $taskDetailStore.isOpen && task}
  <div class="panel-backdrop" on:click={taskDetailStore.hide}></div>
  
  <aside class="detail-panel task-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <div>
        <span class="header-subtitle">Gestionando Tarea</span>
        <h2 title={task.taskName}>{task.taskName}</h2>
        <p>del Proceso: {task.processName}</p>
      </div>
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
      {#if activeTab === 'form'}
        <!-- Formulario de Tarea -->
        <div class="form-content">
            <div class="previous-task-context">
                <div class="context-header">
                    <Icon name="arrow-left-circle" size={18}/>
                    <h4>Contexto de la Tarea Anterior</h4>
                </div>
                <p class="context-task-name">{previousTaskContext.name}</p>
                <div class="context-comment">
                    <p class="comment-author"><strong>{previousTaskContext.user}</strong> comentó:</p>
                    <blockquote>"{previousTaskContext.comment}"</blockquote>
                </div>
            </div>

            <div class="form-placeholder">
              <p class="placeholder-text">Esta área contendrá los campos de negocio específicos para la tarea "{task.taskName}".</p>
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
        <!-- Contenido de Detalles del Proceso (Integrado aquí) -->
        <div class="process-details-content">
          <div class="left-column">
            <section class="info-section">
                <h3><Icon name="info" size={16}/> Información General</h3>
                <ul class="data-list">
                    {#each mockProcessData.generalInfo as item}
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
                    <span class="progress-indicator">Paso {currentStepNumber} de {totalSteps}</span>
                </div>
                <div class="timeline">
                    {#each descendingExecutedTimeline as step, i (step.taskName)}
                    <div class="timeline-item status-{step.status.toLowerCase()}">
                        <div class="timeline-connector">
                        <div class="timeline-icon">
                            <Icon name={getStatusIcon(step.status).name} size={16} color={getStatusIcon(step.status).color} />
                        </div>
                        {#if i < descendingExecutedTimeline.length - 1}
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
                  <h3><Icon name="file-text" size={16}/> Detalles de la Solicitud</h3>
                  <div class="form-placeholder-details">
                      {#each mockProcessData.businessData as field}
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
                      {#each mockProcessData.comments as comment}
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
                  </div>
              </section>
               <section class="info-section">
                  <h3><Icon name="paperclip" size={16}/> Documentos</h3>
                   <div class="documents-section">
                      {#each mockProcessData.documents as docGroup}
                          <h4>{docGroup.taskName}</h4>
                          <ul class="file-list">
                          {#each docGroup.files as file}
                              <li>
                              <Icon name={file.type === 'pdf' ? 'file-text' : 'file'} size={20} class="file-icon"/>
                              <div class="file-info">
                                  <a href="#" class="file-name">{file.name}</a>
                                  <span class="file-meta">Subido por {file.user} el {file.date}</span>
                              </div>
                              <a href="#" class="download-btn" title="Descargar"><Icon name="download" size={18}/></a>
                              </li>
                          {/each}
                          </ul>
                      {/each}
                  </div>
              </section>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </aside>
{/if}

<style>
/* Estilos generales del panel */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1050;
}
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

/* Estilos de Pestañas */
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

/* Contenido Principal */
.panel-content-full { flex-grow: 1; overflow-y: auto; padding: 2rem; }

/* Contenido de la Pestaña del Formulario */
.form-content { display: flex; flex-direction: column; height: 100%; }

.previous-task-context {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.context-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
.context-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.context-task-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
}
.context-comment .comment-author {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}
.context-comment blockquote {
    margin: 0;
    padding: 1rem;
    background-color: var(--bg-primary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-style: italic;
}


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

/* Contenido de la Pestaña de Detalles del Proceso */
.process-details-content { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: 100%; }
.left-column { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
.right-column-details { display: flex; flex-direction: column; min-width: 0; overflow-y: auto; }
.tab-content-details { display: flex; flex-direction: column; gap: 2rem; }
.info-section { background-color: var(--bg-secondary); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border-color); }
.form-placeholder-details { display: flex; flex-direction: column; gap: 1.5rem; }
.value-box { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; color: var(--text-secondary); white-space: pre-wrap; word-wrap: break-word; }

/* Estilos de Trazabilidad, Comentarios, etc. */
.data-list, .timeline, .comments-section, .documents-section { /* (estilos idénticos a ProcessDetailView, no se repiten por brevedad) */ }
.timeline-header { display: flex; justify-content: space-between; align-items: center; }
.timeline-header h3 { margin: 0; }
.progress-indicator { font-size: 0.85rem; font-weight: 500; background-color: var(--bg-hover); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 99px; }
.data-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.data-list li { display: flex; align-items: flex-start; gap: 0.75rem; }
.data-icon { color: var(--accent-color); margin-top: 3px; }
.data-list .label { display: block; font-size: 0.85rem; color: var(--text-secondary); }
.data-list .value { font-weight: 500; color: var(--text-primary); }
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