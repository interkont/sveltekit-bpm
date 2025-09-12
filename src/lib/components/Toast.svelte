<script lang="ts">
  // --- AJUSTE: Se actualizan las rutas de importación ---
  import { toast } from '$lib/stores/toast';
  import { fly } from 'svelte/transition'; // No necesita cambios
  import Icon from '$lib/components/Icon.svelte';
</script>

<!-- Este contenedor vivirá en una esquina de la pantalla -->
<div class="toast-container">
  <!-- Hacemos un bucle sobre cada notificación activa en nuestra tienda -->
  {#each $toast as t (t.id)}
    <div 
      class="toast toast-{t.type}" 
      in:fly={{ y: 20, duration: 300 }} 
      out:fly={{ y: -20, duration: 300, opacity: 0 }}
    >
      <div class="toast-icon">
        {#if t.type === 'success'}
          <Icon name="check-circle" size={20} />
        {:else if t.type === 'error'}
          <Icon name="x-circle" size={20} />
        {/if}
      </div>
      <p>{t.message}</p>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 9999;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    min-width: 250px;
  }
  .toast-success {
    background-color: #2f855a; /* Verde oscuro */
  }
  .toast-error {
    background-color: #c53030; /* Rojo oscuro */
  }
  .toast-icon {
    flex-shrink: 0;
  }
  p {
    margin: 0;
    font-weight: 500;
  }
</style>