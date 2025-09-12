<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { processDetailStore } from '$lib/stores/processDetailStore';
  import Icon from '$lib/components/Icon.svelte';
  
  // --- AJUSTE: Importamos los nuevos tipos que definimos ---
  import type { ProcessMockData, TimelineStep, TimelineStatus } from '$lib/types';

  // --- AJUSTE: Tipamos la variable de estado para las pestañas ---
  let activeTab: 'details' | 'comments' | 'documents' = 'details';

  // --- AJUSTE: Aplicamos la 'interface' principal a nuestro objeto de datos ---
  const mockData: ProcessMockData = {
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
      { label: 'Proveedor Sugerido', value: 'Tech Solutions Inc.' },
      { label: 'Contacto del Proveedor', value: 'sales@techsolutions.com' },
      { label: 'Fecha Límite para la Compra', value: '2023-11-15' },
      { label: 'Presupuesto Aprobado para el Periodo', value: '$10,000.00 USD' },
    ],
    timeline: [
      { taskName: 'Inicio de Solicitud', status: 'COMPLETED', user: 'Ana Martínez', date: '2023-10-27 14:30' },
      { taskName: 'Aprobación de Gerente', status: 'COMPLETED', user: 'Carlos Vega', date: '2023-10-28 10:15' },
      { taskName: 'Revisión de Finanzas', status: 'IN_PROGRESS', user: 'Sofía Loren', date: null },
      { taskName: 'Creación de Orden de Compra', status: 'PENDING', user: 'N/A', date: null },
      { taskName: 'Recepción de Mercancía', status: 'PENDING', user: 'N/A', date: null },
      { taskName: 'Cierre de Proceso', status: 'PENDING', user: 'N/A', date: null },
    ],
    comments: [
        { user: 'Ana Martínez', text: 'Adjunto la cotización inicial del proveedor.', date: '2023-10-27 14:30', avatar: 'AM' },
        { user: 'Carlos Vega', text: 'El monto parece razonable. Aprobado por mi parte. Por favor, revisar presupuesto.', date: '2023-10-28 10:15', avatar: 'CV' },
    ],
    documents: [
      { taskName: 'Inicio de Solicitud', files: [{ name: 'Cotizacion_TechSolutions.pdf', type: 'pdf', date: '2023-10-27', user: 'Ana Martínez' }] },
      { taskName: 'Aprobación de Gerente', files: [{ name: 'Justificacion_Compra.docx', type: 'doc', date: '2023-10-28', user: 'Carlos Vega' }] },
    ]
  };
  
  // TypeScript ahora infiere automáticamente que 'executedTimeline' es de tipo: TimelineStep[]
  const executedTimeline = mockData.timeline.filter(
    (step: TimelineStep) => step.status === 'COMPLETED' || step.status === 'IN_PROGRESS'
  );

  const descendingExecutedTimeline: TimelineStep[] = executedTimeline.slice().reverse();

  const totalSteps: number = mockData.timeline.length;
  const currentStepNumber: number = executedTimeline.length;

  // --- AJUSTE: Tipamos el parámetro de la función y su valor de retorno ---
  function getStatusIcon(status: TimelineStatus): { name: string; color: string } {
    if (status === 'COMPLETED') return { name: 'check-circle', color: 'var(--success-color)' };
    if (status === 'IN_PROGRESS') return { name: 'loader', color: 'var(--accent-color)' };
    return { name: 'circle', color: 'var(--text-secondary)' };
  }
</script>

{#if $processDetailStore.isOpen && $processDetailStore.process}
  <div class="panel-backdrop" on:click={processDetailStore.hide}></div>
  
  <aside class="detail-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <!-- Encabezado del Panel -->
    <header class="panel-header">
      <div>
        <h2 title={$processDetailStore.process.processName}>{$processDetailStore.process.processName}</h2>
        <p>ID: {$processDetailStore.process.id} | Estado: <span class="status-chip">{$processDetailStore.process.status}</span></p>
      </div>
      <button class="close-btn" on:click={processDetailStore.hide} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </header>

    <!-- Contenido Principal (Layout de 2 Columnas) -->
    <div class="panel-content">
      <!-- Columna Izquierda (Resumen y Trazabilidad) -->
      <div class="left-column">
        <!-- Sección de Información General -->
        <section class="info-section">
          <h3><Icon name="info" size={16}/> Información General</h3>
          <ul class="data-list">
            {#each mockData.generalInfo as item}
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

        <!-- Sección de Trazabilidad (Timeline) -->
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

      <!-- Columna Derecha (Contenido Principal con Tabs) -->
      <div class="right-column">
        <div class="tab-header">
          <button class:active={activeTab === 'details'} on:click={() => activeTab = 'details'}>
            <Icon name="file-text" size={16}/> Detalles de la Solicitud
          </button>
          <button class:active={activeTab === 'comments'} on:click={() => activeTab = 'comments'}>
            <Icon name="message-square" size={16}/> Observaciones
          </button>
          <button class:active={activeTab === 'documents'} on:click={() => activeTab = 'documents'}>
            <Icon name="paperclip" size={16}/> Documentos
          </button>
        </div>

        <div class="tab-content">
          {#if activeTab === 'details'}
            <div class="form-details-section">
              <div class="form-placeholder">
                {#each mockData.businessData as field}
                  <div class="form-field">
                    <label>{field.label}</label>
                    <div class="value-box">
                      {field.value}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else if activeTab === 'comments'}
            <div class="comments-section">
              {#each mockData.comments as comment}
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
          {:else if activeTab === 'documents'}
            <div class="documents-section">
              {#each mockData.documents as docGroup}
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
          {/if}
        </div>
      </div>
    </div>
  </aside>
{/if}

<style>
/* Estilos generales del panel y backdrop */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.detail-panel {
  position: fixed; top: 0; right: 0;
  width: 85vw; max-width: 1400px; height: 100vh;
  background-color: var(--bg-primary);
  box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
  z-index: 1001;
  display: flex; flex-direction: column;
}

/* Header */
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.panel-header h2 { margin: 0; color: var(--text-primary); font-size: 1.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.panel-header p { margin: 0.25rem 0 0; color: var(--text-secondary); }
.status-chip { background-color: #38a16920; color: #38a169; padding: 0.2rem 0.6rem; border-radius: 99px; font-weight: 500; }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }
.close-btn:hover { color: var(--text-primary); }

/* Contenido Principal y Layout */
.panel-content {
  flex-grow: 1; display: grid; grid-template-columns: 350px 1fr;
  gap: 2rem; padding: 2rem; overflow: hidden;
}
.left-column {
  display: flex; flex-direction: column; gap: 2rem;
  border-right: 1px solid var(--border-color);
  padding-right: 2rem; overflow-y: auto;
	overflow: auto;
}
.right-column { display: flex; flex-direction: column; min-width: 0; overflow: auto;}
.info-section h3 {
  display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem 0;
  font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.05em; font-weight: 600;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.timeline-header h3 {
  margin: 0;
}
.progress-indicator {
  font-size: 0.85rem;
  font-weight: 500;
  background-color: var(--bg-hover);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
}

/* Lista de Datos */
.data-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.data-list li { display: flex; align-items: flex-start; gap: 0.75rem; }
.data-icon { color: var(--accent-color); margin-top: 3px; }
.data-list .label { display: block; font-size: 0.85rem; color: var(--text-secondary); }
.data-list .value { font-weight: 500; color: var(--text-primary); }

/* Timeline */
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; position: relative; }
.timeline-connector { display: flex; flex-direction: column; align-items: center; margin-right: 1rem; }
.timeline-icon {
  width: 32px; height: 32px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
  border: 2px solid var(--border-color); background-color: var(--bg-secondary);
  z-index: 1;
}
.timeline-line { flex-grow: 1; width: 2px; background-color: var(--border-color); }
.status-in_progress .timeline-icon { border-color: var(--accent-color); }
.status-completed .timeline-icon { border-color: var(--success-color); background-color: var(--success-color); color: white !important; }
.timeline-content { padding-bottom: 2rem; }
.task-name { font-weight: 600; margin: 0.5rem 0 0.25rem; }
.user-info { font-size: 0.85rem; color: var(--text-secondary); }
.status-in_progress .task-name { color: var(--accent-color); }

/* Columna Derecha - Tabs */
.tab-header { display: flex; border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem; flex-shrink: 0; }
.tab-header button {
  display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
  padding: 0.75rem 1rem; font-size: 1rem; font-weight: 500; cursor: pointer;
  color: var(--text-secondary); position: relative;
  border-bottom: 2px solid transparent; transform: translateY(2px);
}
.tab-header button.active { color: var(--accent-color); border-color: var(--accent-color); }
.tab-header button:hover { color: var(--text-primary); }
.tab-content { flex-grow: 1; overflow-y: auto; padding-right: 1rem; }

/* Sección de Detalles de Formulario */
.form-placeholder { display: flex; flex-direction: column; gap: 1.5rem; }
.form-field label { font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; display: block; }
.value-box {
  background-color: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 0.75rem 1rem; color: var(--text-secondary);
  white-space: pre-wrap; word-wrap: break-word;
}

/* Sección de Comentarios */
.comments-section { display: flex; flex-direction: column; gap: 1.5rem; }
.comment-bubble { display: flex; gap: 1rem; }
.comment-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background-color: var(--accent-color); color: white;
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.comment-content {
  background-color: var(--bg-secondary); padding: 0.75rem 1rem;
  border-radius: 8px; border: 1px solid var(--border-color); width: 100%;
}
.comment-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.comment-header span { font-size: 0.8rem; color: var(--text-secondary); }
.comment-content p { margin: 0; }

/* Sección de Documentos */
.documents-section h4 { color: var(--text-primary); margin: 0 0 1rem 0; }
.file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.file-list li {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
  border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-secondary);
}
.file-icon { color: var(--text-secondary); }
.file-info { flex-grow: 1; }
.file-name { color: var(--accent-color); text-decoration: none; font-weight: 500; }
.file-name:hover { text-decoration: underline; }
.file-meta { display: block; font-size: 0.8rem; color: var(--text-secondary); }
.download-btn { color: var(--text-secondary); }
.download-btn:hover { color: var(--accent-color); }
</style>