<script lang="ts">
	import '../app.css';
	// --- AJUSTE CLAVE: Importar CSS de BPMN globalmente ---
	import '$lib/vendor/bpmn-styles/diagram-js.css';
	import '$lib/vendor/bpmn-styles/bpmn-embedded.css';
	import '$lib/vendor/bpmn-styles/bpmn-js-properties-panel.css';

	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { authStore } from '$lib/stores/authStore';

	// Componentes de Layout Global
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ProfilePanel from '$lib/components/ProfilePanel.svelte';

	// Stores para Paneles y Modales Globales
	import { modal } from '$lib/stores/modal';
	import { profilePanelStore } from '$lib/stores/profilePanelStore';
	import { toast } from '$lib/stores/toast';

	onMount(() => {
		theme.init();
		authStore.init();
	});

	function handleConfirm() {
		if ($modal.onConfirm) {
			$modal.onConfirm();
		}
		modal.hide();
	}

	function handleProfileSubmit(event: CustomEvent<{ name: string; email: string }>) {
		const { name } = event.detail;
		profilePanelStore.set(false);
		toast.show(`Perfil de ${name} actualizado.`);
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-container">
	{#if $authStore.isAuthenticated}
		<div class="main-layout">
			<Sidebar></Sidebar>
			<div class="content-wrapper">
				<Header></Header>
				<main class="main-content">
					<!-- SvelteKit renderizará la página actual (+page.svelte) aquí -->
					<slot></slot>
				</main>
			</div>
		</div>
	{:else}
		<!-- Renderizamos el slot para que la página de Login se muestre -->
		<slot></slot>
	{/if}

	<!-- Modales y Paneles Globales -->
	<Toast></Toast>

	<ConfirmModal
		show={$modal.isOpen}
		title={$modal.title}
		message={$modal.message}
		on:confirm={handleConfirm}
		on:cancel={modal.hide}
	></ConfirmModal>

	{#if $profilePanelStore}
		<ProfilePanel on:submit={handleProfileSubmit}></ProfilePanel>
	{/if}
</div>

<style>
	:root {
		--bg-primary: #ffffff;
		--bg-secondary: #f9fafb;
		--bg-sidebar: #1a202c;
		--text-primary: #1f2937;
		--text-secondary: #6b7280;
		--text-sidebar: #a0aec0;
		--text-sidebar-active: #ffffff;
		--border-color: #e5e7eb;
		--accent-color: #4f46e5;
		--success-color: #48bb78;
	}

	:root.dark {
		--bg-primary: #1f2937;
		--bg-secondary: #374151;
		--bg-sidebar: #111827;
		--text-primary: #f9fafb;
		--text-secondary: #9ca3af;
		--text-sidebar: #9ca3af;
		--text-sidebar-active: #ffffff;
		--border-color: #4b5563;
		--accent-color: #6366f1;
	}

	:global(body) {
		font-family: 'Inter', sans-serif;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		margin: 0;
	}

	.main-layout {
		display: flex;
		height: 100vh;
	}

	.content-wrapper {
		flex: 1 1 0%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.main-content {
		flex: 1 1 0%;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 2rem;
	}
	:global(.list-name) {
		font-weight: 700;
    	color: var(--text-primary);
	}
</style>
