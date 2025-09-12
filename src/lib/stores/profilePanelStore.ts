import { writable } from 'svelte/store';

// --- AJUSTE: Le decimos explícitamente al store que solo manejará valores booleanos ---
// Al usar el genérico <boolean>, creamos un contrato estricto para este store.
export const profilePanelStore = writable<boolean>(false);
