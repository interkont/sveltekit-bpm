<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import SimpleBarChart from '$lib/components/SimpleBarChart.svelte';
  import DonutChart from '$lib/components/DonutChart.svelte';
  
  // --- AJUSTE: Importamos todas las 'interfaces' que usaremos para tipar nuestros datos ---
  import type { 
    StatCard, 
    ChartDataItem, 
    DonutChartSegment, 
    ActivityItem, 
    SlowProcess 
  } from '$lib/types';

  // --- AJUSTE: Aplicamos el tipo correspondiente a cada array de datos ---

  const stats: StatCard[] = [
    { value: 76, label: 'Tareas Pendientes', icon: 'list', color: 'blue' },
    { value: 12, label: 'Procesos Activos', icon: 'trending-up', color: 'green' },
    { value: 3, label: 'Tareas Vencidas', icon: 'alert-circle', color: 'red' },
    { value: '2.5 días', label: 'Tiempo Promedio Ciclo', icon: 'clock', color: 'yellow' }
  ];

  const processData: ChartDataItem[] = [
    { label: 'Ene', value: 30 }, { label: 'Feb', value: 45 }, { label: 'Mar', value: 62 },
    { label: 'Abr', value: 55 }, { label: 'May', value: 78 }, { label: 'Jun', value: 90 }
  ];
  
  const topProcessesData: ChartDataItem[] = [
      { label: 'Compras', value: 125 },
      { label: 'Reembolso', value: 98 },
      { label: 'Vacaciones', value: 75 },
      { label: 'Soporte IT', value: 55 },
      { label: 'Contratación', value: 32 }
  ];
  
  const performanceData: DonutChartSegment[] = [
    { label: 'Ventas', value: 42, color: '#4299e1' },
    { label: 'Finanzas', value: 28, color: '#48bb78' },
    { label: 'Operaciones', value: 15, color: '#f56565' },
    { label: 'RRHH', value: 10, color: '#f6e05e' }
  ];

  const recentActivity: ActivityItem[] = [
    { user: 'Ana Gómez', action: 'completó la tarea', task: 'Aprobación de Factura #8821', time: 'hace 5 min' },
    { user: 'Sistema', action: 'inició el proceso', task: 'Contratación de Personal #034', time: 'hace 2 horas' },
    { user: 'Carlos Ruiz', action: 'añadió un comentario en', task: 'Revisión de Contrato #543', time: 'hace 3 horas' },
    { user: 'Laura Méndez', action: 'rechazó la tarea', task: 'Solicitud de Compra #1120', time: 'hace 8 horas' }
  ];
  
  const slowProcesses: SlowProcess[] = [
    { id: 'PROC-098', name: 'Auditoría Interna Q3', duration: '12 días', bottleneck: 'Revisión Legal' },
    { id: 'PROC-102', name: 'Desarrollo Nuevo Módulo', duration: '9 días', bottleneck: 'Aprobación Gerencia' },
    { id: 'PROC-076', name: 'Campaña Marketing Invierno', duration: '8 días', bottleneck: 'Diseño Gráfico' },
  ];
</script>

<div class="dashboard">
  <h1 class="dashboard-title">Dashboard General</h1>
  
  <!-- Stat Cards -->
  <div class="stats-grid">
    {#each stats as stat}
      <div class="stat-card stat-card--{stat.color}">
        <div class="stat-icon">
          <Icon name={stat.icon} size={28}/>
        </div>
        <div class="stat-info">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Main Grid for Charts and Tables -->
  <div class="main-grid">
    <!-- CAMBIO: El gráfico de barras ahora es de tamaño 'medium' -->
    <div class="grid-item medium">
      <SimpleBarChart data={processData} title="Instancias (últimos 6 meses)"/>
    </div>
    
    <div class="grid-item medium">
       <DonutChart data={performanceData} title="Tareas por Equipo"/>
    </div>

    <!-- NUEVO: Otro gráfico de barras para los procesos más solicitados -->
    <div class="grid-item medium">
      <SimpleBarChart data={topProcessesData} title="Procesos Más Solicitados"/>
    </div>

    <div class="grid-item medium">
      <div class="activity-feed">
        <h4>Actividad Reciente</h4>
        <ul>
          {#each recentActivity as item}
            <li>
              <div class="activity-icon">
                  <Icon name="git-commit" size={20}/>
              </div>
              <div class="activity-details">
                <p><strong>{item.user}</strong> {item.action} <em>{item.task}</em></p>
                <span>{item.time}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <div class="grid-item large">
        <div class="slow-processes-table">
            <h4>Procesos con Mayor Duración</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID Proceso</th>
                        <th>Nombre</th>
                        <th>Duración Actual</th>
                        <th>Tarea Bloqueante</th>
                    </tr>
                </thead>
                <tbody>
                    {#each slowProcesses as process}
                        <tr>
                            <td>{process.id}</td>
                            <td>{process.name}</td>
                            <td>{process.duration}</td>
                            <td><span class="bottleneck-tag">{process.bottleneck}</span></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
  </div>
</div>

<style>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Stat Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.stat-card--blue { border-color: #4299e1; }
.stat-card--green { border-color: #48bb78; }
.stat-card--red { border-color: #f56565; }
.stat-card--yellow { border-color: #f6e05e; }

.stat-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-card--blue .stat-icon { background-color: #ebf8ff; color: #4299e1; }
.stat-card--green .stat-icon { background-color: #f0fff4; color: #48bb78; }
.stat-card--red .stat-icon { background-color: #fff5f5; color: #f56565; }
.stat-card--yellow .stat-icon { background-color: #fffbeb; color: #f6e05e; }

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.9rem; color: var(--text-secondary); }

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(300px, auto);
  gap: 1.5rem;
}
.grid-item.large { grid-column: span 2; }
.grid-item.medium { grid-column: span 1; }

/* Activity Feed */
.activity-feed {
  background-color: var(--bg-secondary);
  padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  height: 100%; display: flex; flex-direction: column;
}
.activity-feed h4 { margin: 0 0 1.5rem 0; color: var(--text-primary); font-size: 1.1rem; }
.activity-feed ul { list-style: none; padding: 0; margin: 0; overflow-y: auto; }
.activity-feed li { display: flex; gap: 1rem; position: relative; padding-bottom: 1.5rem; }
.activity-feed li:not(:last-child)::before {
  content: ''; position: absolute; left: 9px; top: 24px; bottom: -0.5rem;
  width: 2px; background-color: var(--border-color);
}
.activity-icon { color: var(--text-secondary); }
.activity-details p { margin: 0 0 0.25rem 0; font-size: 0.9rem; }
.activity-details em { color: var(--accent-color); font-style: normal; }
.activity-details span { font-size: 0.8rem; color: var(--text-secondary); }

/* Slow Processes Table */
.slow-processes-table {
  background-color: var(--bg-secondary);
  padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.slow-processes-table h4 { margin: 0 0 1.5rem 0; color: var(--text-primary); font-size: 1.1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
th { font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); }
td { font-size: 0.9rem; }
.bottleneck-tag {
  background-color: #fff5f5; color: #c53030;
  padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500;
}
</style>