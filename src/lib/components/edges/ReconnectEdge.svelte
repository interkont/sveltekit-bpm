<script lang="ts">
  import { BaseEdge, EdgeReconnectAnchor, getBezierPath, EdgeLabel, type EdgeProps } from '@xyflow/svelte';

  // Aceptamos las props adicionales para un renderizado completo y correcto
  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;
  export let sourcePosition: EdgeProps['sourcePosition'];
  export let targetPosition: EdgeProps['targetPosition'];
  export let selected: boolean | undefined = undefined;
  export let markerEnd: string | undefined = undefined;
  export let label: EdgeProps['label'];

  let reconnecting = false;

  // Usamos getBezierPath con las posiciones para restaurar la curva natural.
  // También capturamos labelX y labelY para la etiqueta.
  $: [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
</script>

{#if !reconnecting}
  <BaseEdge path={edgePath} {markerEnd} />

  {#if label}
    <!-- SOLUCIÓN: Movemos 'transform' a la prop 'style' para el centrado CSS. -->
    <EdgeLabel x={labelX} y={labelY} style="transform: translate(-50%, -50%)">{label}</EdgeLabel>
  {/if}
{/if}

{#if selected}
  <EdgeReconnectAnchor
    type="target"
    bind:reconnecting
    position={{ x: targetX, y: targetY }}
    style="
      background: var(--accent-color);
      width: 12px;
      height: 12px;
      border: 2px solid white;
      border-radius: 100%;
      box-shadow: 0 0 0 1.5px var(--accent-color);
    "
  />
{/if}
