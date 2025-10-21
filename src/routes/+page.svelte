<script lang="ts">
	import { page } from '$app/stores';
	import type { ProcessDefinition } from '$lib/types';
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
	import ProcessEditorView from '$lib/components/ProcessEditorView.svelte';
	import ProcessModelListView from '$lib/components/ProcessModelListView.svelte';
    import UserManagementView from '$lib/components/UserManagementView.svelte';
	import StartProcessFormView from '$lib/components/StartProcessFormView.svelte';

	// Paneles de Detalle
	import TaskDetailPanel from '$lib/components/TaskDetailPanel.svelte';
	import ProcessDetailView from '$lib/components/ProcessDetailView.svelte';
	
	// --- ADD: Global UI Components ---
	import Toast from '$lib/components/Toast.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	
	let currentView = 'dashboard';
	let viewParams: string | null = null;
	let viewContext: any = null; 

	$: {
		if (typeof window !== 'undefined') {
			const hash = $page.url.hash.substring(1);
			const [view, params] = hash.split('/');
			currentView = view || 'dashboard';
			viewParams = params || null;
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

<!-- --- ADD: Render global Toast component --- -->
<Toast />
<ConfirmModal />

{#if !$authStore.token}
	<LoginView />
{:else}
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
			<ProcessEditorView />
		{:else if currentView === 'process-model-detail' && viewParams}
			<ProcessEditorView processId={Number(viewParams)} />
		{:else if currentView === 'new-process'}
			<NewProcessView on:navigate={handleNavigation} />
		{:else if currentView === 'start-process-form'}
			<StartProcessFormView processDefinition={viewContext as ProcessDefinition} on:navigate={handleNavigation} />
		{:else if currentView === 'users'} 
			<UserManagementView />
		{/if}
	</SvelteFlowProvider>

	{#if $taskDetailStore.isOpen}
		<TaskDetailPanel on:submit={handleTaskSubmit} />
	{/if}

	{#if $processDetailStore.isOpen}
		<ProcessDetailView />
	{/if}
{/if}
