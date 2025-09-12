import { writable } from 'svelte/store';
// --- ADJUSTMENT: Import the 'interface' for a process model ---
import type { ProcessModel } from '$lib/types';

// --- ADJUSTMENT: Create an 'interface' to describe the shape of the store's state ---
interface ProcessModelDetailState {
  isOpen: boolean;
  model: ProcessModel | null;
}

// --- Initial State, now typed with our new 'interface' ---
const initialState: ProcessModelDetailState = {
  isOpen: false,
  model: null,
};

// --- ADJUSTMENT: Tell the store it will always manage a state of type 'ProcessModelDetailState' ---
const { subscribe, set } = writable<ProcessModelDetailState>(initialState);

export const processModelDetailStore = {
  subscribe,
  // --- ADJUSTMENT: Type the parameter of the 'show' function ---
  show: (modelData: ProcessModel) => set({ isOpen: true, model: modelData }),
  hide: () => set(initialState),
};