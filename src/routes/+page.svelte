<script lang="ts">
	import { page } from '$app/stores';

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
	import ModelerTest from '$lib/components/ModelerNew.svelte';
    import UserManagementView from '$lib/components/UserManagementView.svelte';

	// Paneles de Detalle
	import TaskDetailPanel from '$lib/components/TaskDetailPanel.svelte';
	import ProcessDetailView from '$lib/components/ProcessDetailView.svelte';
	import ProcessModelDetailView from '$lib/components/ProcessModelDetailView.svelte';
	
	let currentView = 'dashboard';

    // Este bloque reactivo leerá el #hash de la URL y cambiará la vista
	$: {
		if (typeof window !== 'undefined') {
			const hash = $page.url.hash.substring(1);
			currentView = hash || 'dashboard';
		}
	}

	function handleTaskSubmit(event: CustomEvent<{action: string, comments: string, task: Task}>) {
		const { action, comments, task } = event.detail;
		toast.show(`Tarea "${task.taskName}" finalizada con éxito.`);
		taskDetailStore.hide();
	}

    function handleNavigation(event: CustomEvent<{view: string}>) {
        if (typeof window !== 'undefined') {
            window.location.hash = event.detail.view;
        }
    }
</script>

{#if !$authStore.isAuthenticated}
	<LoginView />
{:else}
	<!-- Router principal basado en el Hash de la URL -->
	{#if currentView === 'dashboard'}
		<DashboardView />
	{:else if currentView === 'tasks'}
		<TaskListView />
	{:else if currentView === 'processes'}
		<ProcessListView on:navigate={handleNavigation} />
	{:else if currentView === 'process-models'}
		<ProcessModelListView />
    {:else if currentView === 'test-modeler'}
		<ModelerTest />
	{:else if currentView === 'new-process'}
		<NewProcessView on:navigate={handleNavigation} />
    {:else if currentView === 'users'} 
        <UserManagementView />
	{/if}

	<!-- Renderizado condicional de Paneles -->
	{#if $taskDetailStore.isOpen}
		<TaskDetailPanel task={$taskDetailStore.task} on:submit={handleTaskSubmit} />
	{/if}

	{#if $processDetailStore.isOpen}
		<ProcessDetailView process={$processDetailStore.process} />
	{/if}

	{#if $processModelDetailStore.isOpen}
		<ProcessModelDetailView model={$processModelDetailStore.model} />
	{/if}
{/if}
