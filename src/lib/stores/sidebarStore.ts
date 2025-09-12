import { writable } from 'svelte/store';
// --- AJUSTE: Importamos 'browser' de SvelteKit para una detección segura del entorno ---
import { browser } from '$app/environment';

const key = 'sidebarCollapsed';
const defaultValue = false;

// --- AJUSTE: La lógica de inicialización se simplifica usando 'browser' ---
// Esta variable solo es 'true' cuando el código se ejecuta en el navegador.
const initialValue = browser ? (localStorage.getItem(key) === 'true') : defaultValue;

// --- AJUSTE: Le decimos explícitamente al store que solo manejará valores booleanos ---
const { subscribe, set, update } = writable<boolean>(initialValue);

export const sidebarStore = {
  subscribe,
  toggle: () => update((value: boolean) => { // Tipamos el parámetro para mayor claridad
    const newValue = !value;
    if (browser) {
      // localStorage solo puede guardar strings, por lo que convertimos el booleano
      localStorage.setItem(key, String(newValue));
    }
    return newValue;
  }),
  set, // El 'set' heredado ahora también es 'type-safe' gracias a writable<boolean>
};