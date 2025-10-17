<script lang="ts">
	import { page } from '$app/stores';
	import type { ProcessDefinition } from '$lib/types';
	// --- SOLUTION: Import the SvelteFlowProvider ---
	import { SvelteFlowProvider } from '@xyflow/svelte';

	// Stores
	import { authStore } from '$lib/stores/authStore';
	import { taskDetailStore } from '$lib/stores/taskDetailStore';
	import { processDetailStore } from '$lib/stores/processDetailStore';
	import { processModelDetailStore } from '$lib/stores/processModelDetailStore';
	import { toast } from '$lib/stores/toast';
    import type { Task } from '$lib/types';

	// Vistas (Componentes de página)
	import LoginView from '$lib/components/LoginView.svelte';
	import DashboardView from '$lib/components/DashboardView.svelte';
	import TaskListView from '$lib/components/TaskListView.svelte';
	import ProcessListView from '$lib/components/ProcessListView.svelte';
	import NewProcessView from '$lib/components/NewProcessView.svelte';
	import ProcessModelListView from '$lib/components/ProcessModelListView.svelte';
    import UserManagementView from '$lib/components/UserManagementView.svelte';
	import StartProcessFormView from '$lib/components/StartProcessFormView.svelte';

	// Paneles de Detalle
	import TaskDetailPanel from '$lib/components/TaskDetailPanel.svelte';
	import ProcessDetailView from '$lib/components/ProcessDetailView.svelte';
	import ProcessModelDetailView from '$lib/components/ProcessModelDetailView.svelte';
	
	let currentView = 'dashboard';
	let viewContext: any = null; // Variable to hold context for views

    // Este bloque reactivo leerá el #hash de la URL y cambiará la vista
	$: {
		if (typeof window !== 'undefined') {
			const hash = $page.url.hash.substring(1);
			// Default to 'dashboard' if hash is empty or just '#'
			currentView = hash || 'dashboard';
		}
	}

	function handleTaskSubmit(event: CustomEvent<{action: string, comments: string, task: Task}>) {
		const { action, comments, task } = event.detail;
		toast.show(`Tarea "${task.taskName}" finalizada con éxito.`);
		taskDetailStore.hide();
	}

    function handleNavigation(event: CustomEvent<{view: string, context?: any}>) {
        if (typeof window !== 'undefined') {
			viewContext = event.detail.context;
            window.location.hash = event.detail.view;
        }
    }
</script>

{#if !$authStore.token}
	<LoginView />
{:else}
	<!-- --- SOLUTION: Wrap the entire view router in the SvelteFlowProvider --- -->
	<SvelteFlowProvider>
		{#if currentView === 'dashboard'}
			<DashboardView />
		{:else if currentView === 'tasks'}
			<TaskListView />
		{:else if currentView === 'processes'}
			<ProcessListView on:navigate={handleNavigation} />
		{:else if currentView === 'process-models'}
			<ProcessModelListView />
		{:else if currentView === 'new-process-model'}
			<!-- This view will now have access to the Svelte Flow context -->
			<NewProcessView />
		{:else if currentView === 'start-process-form'}
			<StartProcessFormView processDefinition={viewContext as ProcessDefinition} on:navigate={handleNavigation} />
		{:else if currentView === 'users'} 
			<UserManagementView />
		{/if}
	</SvelteFlowProvider>

	<!-- Paneles de Detalle (estos no necesitan el provider si no renderizan un diagrama) -->
	{#if $taskDetailStore.isOpen}
		<TaskDetailPanel on:submit={handleTaskSubmit} />
	{/if}

	{#if $processDetailStore.isOpen}
		<ProcessDetailView />
	{/if}

	<!-- --- FIX: Add a check to ensure the model is not null --- -->
	{#if $processModelDetailStore.isOpen && $processModelDetailStore.model}
		<ProcessModelDetailView model={$processModelDetailStore.model} />
	{/if}
{/if}
