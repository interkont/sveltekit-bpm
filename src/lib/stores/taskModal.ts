import { writable } from 'svelte/store';
// --- AJUSTE: Importamos la 'interface' para una Tarea ---
import type { Task } from '$lib/types';

// --- AJUSTE: Se crea una 'interface' para describir la forma del estado del store ---
interface TaskModalState {
  isOpen: boolean;
  task: Task | null;
}

// --- AJUSTE: Se define el estado inicial con el tipo que acabamos de crear ---
const initialState: TaskModalState = {
  isOpen: false,
  task: null,
};

// --- AJUSTE: Le decimos al store que siempre manejará un estado de tipo 'TaskModalState' ---
const { subscribe, set } = writable<TaskModalState>(initialState);

export const taskModal = {
  subscribe,
  // --- AJUSTE: Se tipa el parámetro de la función 'show' ---
  show: (task: Task) => set({ isOpen: true, task }),
  hide: () => set(initialState),
};