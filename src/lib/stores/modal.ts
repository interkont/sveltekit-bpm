import { writable } from 'svelte/store';
// --- AJUSTE: Importamos la 'interface' que define la configuración del modal ---
import type { ModalConfig } from '$lib/types';

// --- AJUSTE: Se crea una 'interface' para describir la forma del estado del store ---
// Usamos 'extends' para heredar las propiedades de ModalConfig y añadir 'isOpen'.
interface ModalState extends ModalConfig {
  isOpen: boolean;
}

// Estado inicial del store, ahora tipado con nuestra nueva 'interface'
const initialState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

// Le decimos al store que siempre debe manejar un estado con la forma de 'ModalState'
const { subscribe, set, update } = writable<ModalState>(initialState);

export const modal = {
  subscribe,
  // --- AJUSTE: Se tipa el parámetro 'config' ---
  // Ahora, la función 'show' solo aceptará un objeto que cumpla con el "contrato" de ModalConfig.
  show: (config: ModalConfig) => update(state => ({
    ...state,
    isOpen: true,
    title: config.title,
    message: config.message,
    onConfirm: config.onConfirm,
  })),
  hide: () => set(initialState),
};