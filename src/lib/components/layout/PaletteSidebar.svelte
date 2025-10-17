<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  // --- Like useDnD from the example ---
  // We get the context that was set in the parent component (NewProcessView)
  const dndType = getContext<Writable<string | null>>('dnd-context');

  function handleDragStart(event: DragEvent, nodeType: string) {
    // We don't need dataTransfer anymore, we just set the value in our context store.
    dndType.set(nodeType);
  }

  function handleDragEnd() {
    // Reset the store when the drag is over.
    dndType.set(null);
  }
</script>

<aside class="palette">
  <h3 class="palette-title">Toolbox</h3>
  <div class="palette-grid">
    <div
      class="palette-item"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, 'startEvent')}
      on:dragend={handleDragEnd}
    >
      <span class="icon">⭕️</span>
      <span>Start Event</span>
    </div>
    <div
      class="palette-item"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, 'userTask')}
      on:dragend={handleDragEnd}
    >
      <span class="icon">📋</span>
      <span>User Task</span>
    </div>
    <div
      class="palette-item"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, 'gateway')}
      on:dragend={handleDragEnd}
    >
      <span class="icon">◆</span>
      <span>Gateway</span>
    </div>
    <div
      class="palette-item"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, 'endEvent')}
      on:dragend={handleDragEnd}
    >
      <span class="icon">🔴</span>
      <span>End Event</span>
    </div>
  </div>
</aside>

<style>
  .palette {
    background-color: #ffffff;
    border-right: 1px solid #e5e7eb;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .palette-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #111827;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .palette-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s ease;
    user-select: none;
  }

  .palette-item:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .palette-item:active {
    cursor: grabbing;
    background-color: #e5e7eb;
  }

  .palette-item .icon {
    font-size: 1.5rem;
  }
</style>
