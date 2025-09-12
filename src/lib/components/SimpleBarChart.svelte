<script lang="ts">
  // --- AJUSTE: Importamos la 'interface' que define la forma de nuestros datos ---
  import type { ChartDataItem } from '$lib/types';

  // --- AJUSTE: Se añaden los tipos a las props del componente ---
  export let data: ChartDataItem[] = [];
  export let title: string = "Gráfico de Barras";
  
  // --- AJUSTE: Se añade el tipo a la variable interna ---
  let maxValue: number = 0;
  
  // La lógica reactiva no cambia. TypeScript infiere los tipos dentro del 'map'.
  $: maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 1;
</script>

<div class="chart-container">
  <h4>{title}</h4>
  <div class="chart">
    <div class="y-axis">
      <span>{maxValue}</span>
      <span>{Math.round(maxValue/2)}</span>
      <span>0</span>
    </div>
    <div class="bars">
      {#each data as item}
        <div class="bar-wrapper" title="{item.label}: {item.value}">
          <div class="bar" style="height: {(item.value / maxValue) * 100}%;"></div>
          <span class="label">{item.label}</span>
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
  display: flex;
  flex-direction: column;
}
h4 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}
.chart {
  flex-grow: 1;
  display: flex;
  gap: 1rem;
}
.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border-right: 1px solid var(--border-color);
  padding-right: 0.5rem;
  flex-shrink: 0;
}
.bars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
  gap: 1rem;
  align-items: flex-end;
  width: 100%;
}
.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
	height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  background-color: var(--accent-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}
.bar-wrapper:hover .bar {
  background-color: #3182ce;
  transform: scaleY(1.05);
}
.label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>