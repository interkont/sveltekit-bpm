<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  // --- AJUSTE: Importamos la nueva 'interface' que acabamos de crear ---
  import type { ProcessTypeCard } from '$lib/types';

  // --- AJUSTE: Se define el "contrato" para los eventos que este componente emite ---
  const dispatch = createEventDispatcher<{
    navigate: { view: string }
  }>();

  // --- Iconos SVG ---
  const icons = {
    shoppingCart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    receipt: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path><path d="M7 2v4"></path><path d="M15 2v4"></path><path d="M21 8.8c.2-.3.2-.6 0-.9l-2-2.4c-.2-.2-.5-.4-.8-.4H12a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.2"></path><path d="M16 14h-3"></path></svg>`,
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`
  };
  
  // --- Datos Simulados de Tipos de Proceso ---
  const processTypes: ProcessTypeCard[] = [
    { key: 'purchase_request', name: 'Solicitud de Compra', description: 'Inicia un proceso para solicitar la compra de bienes o servicios.', icon: icons.shoppingCart },
    { key: 'expense_reimbursement', name: 'Reembolso de Gastos', description: 'Solicita el reembolso de gastos incurridos por motivos de trabajo.', icon: icons.receipt },
    { key: 'hiring_process', name: 'Contratación de Personal', description: 'Gestiona el flujo para contratar a un nuevo empleado.', icon: icons.briefcase }
  ];

  function goBack() {
    // La lógica de la función no cambia, pero ahora el dispatcher es "type-safe"
    dispatch('navigate', { view: 'processes' });
  }
</script>

<div class="view-container">
  <div class="view-header">
     <button class="back-btn" on:click={goBack}>
       <Icon data={icons.arrowLeft} />
       Volver a la Lista
     </button>
  </div>
  <div class="title">
    <h2>Crear Nuevo Proceso</h2>
    <p>Selecciona el tipo de proceso que deseas iniciar.</p>
  </div>

  <div class="process-type-list">
    {#each processTypes as type}
      <div class="type-card">
        <div class="card-icon">
          <Icon data={type.icon} />
        </div>
        <h3>{type.name}</h3>
        <p>{type.description}</p>
        <button class="select-btn">Seleccionar</button>
      </div>
    {/each}
  </div>
</div>

<style>
  .view-container { display: flex; flex-direction: column; gap: 1.5rem; }
  .view-header { display: flex; }
  .title h2 { margin: 0; color: #1a202c; }
  .title p { margin: 0; color: #718096; }

  .back-btn {
    display: flex; align-items: center; gap: 0.5rem;
    background: none; border: none; font-size: 1rem;
    color: #4a5568; cursor: pointer; font-weight: 500;
  }
  .back-btn:hover { color: #1a202c; }

  .process-type-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  .type-card {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    transition: all 0.2s ease-in-out;
  }
  .type-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    border-color: #4299e1;
  }

  .card-icon {
    margin: 0 auto 1.5rem auto;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #4299e133;
    color: #2b6cb0;
  }

  .type-card h3 { margin: 0 0 0.5rem 0; color: #2d3748; }
  .type-card p { color: #718096; margin-bottom: 2rem; line-height: 1.5; }

  .select-btn {
    width: 100%;
    background-color: #2d3748; color: white;
    border: none; padding: 0.75rem 1.5rem; border-radius: 8px;
    font-weight: 500; cursor: pointer; transition: background-color 0.2s;
  }
  .select-btn:hover { background-color: #1a202c; }
</style>