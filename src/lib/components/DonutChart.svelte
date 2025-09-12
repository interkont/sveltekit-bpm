<script lang="ts">
  // --- AJUSTE: Importamos la 'interface' que define la forma de nuestros datos ---
  import type { DonutChartSegment } from '$lib/types';

  // --- AJUSTE: Creamos una interface local para describir los segmentos ya calculados ---
  // Extiende la original y añade las nuevas propiedades que calculamos.
  interface CalculatedSegment extends DonutChartSegment {
    percent: number;
    strokeDasharray: string;
    strokeDashoffset: number;
  }

  // --- AJUSTE: Tipamos las props que recibe el componente ---
  export let data: DonutChartSegment[] = [];
  export let title: string = "Gráfico";

  // --- AJUSTE: Tipamos las variables de estado internas ---
  let total: number = 0;
  let segments: CalculatedSegment[] = [];

  $: {
    // Tipamos los acumuladores y variables dentro del bloque reactivo
    total = data.reduce((sum: number, item: DonutChartSegment) => sum + item.value, 0);
    
    let cumulativePercent: number = 0;
    
    segments = data.map((item: DonutChartSegment) => {
      const percent: number = total > 0 ? (item.value / total) * 100 : 0;
      const offset: number = 25 - cumulativePercent;
      cumulativePercent += percent;
      
      return {
        ...item,
        percent,
        strokeDasharray: `${percent} ${100 - percent}`,
        strokeDashoffset: offset
      };
    });
  }
</script>

<div class="chart-container">
  <h4>{title}</h4>
  <div class="chart-content">
    <svg viewBox="0 0 36 36" class="donut-svg">
      <circle class="donut-hole" cx="18" cy="18" r="15.91549430918954" fill="var(--bg-secondary)"></circle>
      <circle class="donut-ring" cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="var(--border-color)" stroke-width="3"></circle>
      
      {#each segments as segment}
        <circle
          class="donut-segment"
          cx="18" cy="18" r="15.91549430918954"
          fill="transparent"
          stroke={segment.color}
          stroke-width="3.5"
          stroke-dasharray={segment.strokeDasharray}
          stroke-dashoffset={segment.strokeDashoffset}
        ></circle>
      {/each}
       <g class="chart-text">
        <text x="50%" y="50%" class="chart-number">{total}</text>
        <text x="50%" y="50%" class="chart-label">Total</text>
      </g>
    </svg>
    <div class="legend">
      {#each data as item}
        <div class="legend-item">
          <span class="legend-color" style="background-color: {item.color};"></span>
          <span class="legend-label">{item.label}</span>
          <span class="legend-value">{item.value}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
.chart-container {
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  height: 100%;
}
h4 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}
.chart-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.donut-svg {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
  border-radius: 50%;
}
.donut-segment {
    transition: stroke-dasharray 0.3s ease;
}
.chart-text {
    transform: rotate(90deg);
    transform-origin: 50% 50%;
}
.chart-number {
    font-size: 0.6em;
    line-height: 1;
    transform: translateY(-0.25em);
    text-anchor: middle;
    fill: var(--text-primary);
    font-weight: 700;
}
.chart-label {
    font-size: 0.2em;
    transform: translateY(0.7em);
    text-anchor: middle;
    fill: var(--text-secondary);
}
.legend {
  flex-grow: 1;
  display: grid;
  gap: 1rem;
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.75rem;
}
.legend-label {
  color: var(--text-secondary);
}
.legend-value {
  margin-left: auto;
  font-weight: 500;
  color: var(--text-primary);
}
</style>