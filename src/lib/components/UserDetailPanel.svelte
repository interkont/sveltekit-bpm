<script lang="ts">
    import { userDetailStore } from '$lib/stores/userDetailStore';
    import { processRoleStore } from '$lib/stores/processRoleStore';
    import type { User, ProcessRole } from '$lib/types';
    import { onMount } from 'svelte';
    import Icon from "./Icon.svelte";

    export let user: User | null;

    let localUser: Partial<User> = {};
    let processRoles: ProcessRole[] = [];

    processRoleStore.subscribe(value => {
        processRoles = value;
    });

    onMount(() => {
        localUser = user ? { ...user } : { systemRole: 'user', processRoles: [] };
    });

    function handleCancel() {
        userDetailStore.hide();
    }

    function handleSubmit() {
        // Lógica de guardado (lo veremos en el siguiente paso)
        console.log('Guardando usuario:', localUser);
        userDetailStore.hide();
    }

    function toggleProcessRole(roleKey: string) {
        if (!localUser.processRoles) {
            localUser.processRoles = [];
        }
        const index = localUser.processRoles.indexOf(roleKey);
        if (index === -1) {
            localUser.processRoles.push(roleKey);
        } else {
            localUser.processRoles.splice(index, 1);
        }
        localUser.processRoles = [...localUser.processRoles];
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 z-40" on:click={handleCancel}></div>
<div class="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg z-50 transform translate-x-0 transition-transform duration-300 ease-in-out">
    <div class="p-6 h-full flex flex-col">
        <div class="flex justify-between items-center border-b pb-4">
            <h2 class="text-2xl font-semibold">{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
            <button on:click={handleCancel} class="text-gray-500 hover:text-gray-800">
                <Icon name="x" size={24} />
            </button>
        </div>

        <form id="user-form" class="flex-grow overflow-y-auto py-6" on:submit|preventDefault={handleSubmit}>
            <div class="mb-4">
                <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" id="displayName" bind:value={localUser.displayName} class="input" required>
            </div>
            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" id="email" bind:value={localUser.email} class="input" required>
            </div>
            <div class="mb-4">
                <label for="systemRole" class="block text-sm font-medium text-gray-700 mb-1">Rol de Sistema</label>
                <select id="systemRole" bind:value={localUser.systemRole} class="input">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            <div class="mb-4">
                <span class="block text-sm font-medium text-gray-700 mb-2">Roles de Proceso</span>
                <div class="grid grid-cols-2 gap-4">
                    {#each processRoles as role}
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors {localUser.processRoles?.includes(role.key) ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}">
                            <input 
                                type="checkbox" 
                                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                checked={localUser.processRoles?.includes(role.key)} 
                                on:change={() => toggleProcessRole(role.key)}>
                            <div class="ml-3 text-sm">
                                <p class="font-medium text-gray-900">{role.name}</p>
                                <p class="text-gray-500 text-xs">{role.description}</p>
                            </div>
                        </label>
                    {/each}
                </div>
            </div>
        </form>

        <div class="flex justify-end items-center border-t pt-4">
            <button type="button" on:click={handleCancel} class="btn btn-secondary mr-2">Cancelar</button>
            <button type="submit" form="user-form" class="btn btn-primary">Guardar Cambios</button>
        </div>
    </div>
</div>