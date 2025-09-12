import { writable } from 'svelte/store';
// --- AJUSTE: Importamos la 'interface' para una instancia de proceso ---
import type { ProcessInstance } from '$lib/types';

// --- AJUSTE: Se crea una 'interface' para describir la forma del estado del store ---
interface ProcessDetailState {
  isOpen: boolean;
  process: ProcessInstance | null;
}

// --- Estado Inicial, ahora tipado con nuestra nueva 'interface' ---
const initialState: ProcessDetailState = {
  isOpen: false,
  process: null,
};

// --- AJUSTE: Le decimos al store que siempre manejará un estado de tipo 'ProcessDetailState' ---
const { subscribe, set } = writable<ProcessDetailState>(initialState);

export const processDetailStore = {
  subscribe,
  // --- AJUSTE: Se tipa el parámetro de la función 'show' ---
  show: (processData: ProcessInstance) => set({ isOpen: true, process: processData }),
  hide: () => set(initialState),
};
