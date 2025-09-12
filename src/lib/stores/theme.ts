import { writable } from 'svelte/store';
// --- AJUSTE: Importamos 'browser' de SvelteKit para una detección segura del entorno ---
import { browser } from '$app/environment';

// --- AJUSTE: Creamos un tipo específico para el tema ---
// Esto asegura que el store solo pueda contener 'light' o 'dark'.
type Theme = 'light' | 'dark';

// Función para inicializar la tienda
function createThemeStore() {
  // --- AJUSTE: Se usa 'browser' para la lógica del lado del cliente ---
  const storedTheme = browser ? (localStorage.getItem('theme') as Theme) : 'light';
  
  // --- AJUSTE: Le decimos al store que siempre manejará un estado de tipo 'Theme' ---
  const { subscribe, set, update } = writable<Theme>(storedTheme);

  return {
    subscribe,
    // Función para cambiar de tema
    toggle: () => {
      update((current: Theme) => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (browser) {
          localStorage.setItem('theme', newTheme);
          const root = document.documentElement;
          if (newTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        return newTheme;
      });
    },
    // Función para inicializar el tema al cargar la app
    init: () => {
       if (browser) {
          const initialTheme = (localStorage.getItem('theme') as Theme) || 'light';
          const root = document.documentElement;
           if (initialTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          set(initialTheme);
       }
    }
  };
}

export const theme = createThemeStore();

