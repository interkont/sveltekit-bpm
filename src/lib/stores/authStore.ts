// authStore.js
import { writable } from 'svelte/store';
// --- AJUSTE: Se actualiza la ruta de importación ---
import { authenticateUser } from '$lib/services/authService';
// --- AJUSTE: Importamos la 'interface' User ---
import type { User } from '$lib/types';

// --- AJUSTE: Se crea una 'interface' para describir la forma del estado del store ---
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
}

// --- Estado Inicial, ahora tipado con nuestra nueva 'interface' ---
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
};

function createAuthStore() {
  // --- AJUSTE: Le decimos al store que siempre manejará un estado de tipo 'AuthState' ---
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    // --- Acción de Login ---
    // --- AJUSTE: Se tipan los parámetros de la función ---
    login: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const userData = await authenticateUser(email, password);
        
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
        set({ isAuthenticated: true, user: userData, error: null, loading: false });
      } catch (e) {
        // --- AJUSTE: Manejo seguro del error de tipo 'unknown' ---
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        set({ isAuthenticated: false, user: null, error: errorMessage, loading: false });
        
        // Lanzamos el error para que el componente de UI pueda reaccionar
        throw e;
      }
    },

    // --- Acción de Logout ---
    logout: () => {
      if (typeof window !== 'undefined') {
          sessionStorage.removeItem('user');
      }
      set(initialState);
    },
    
    // --- Inicializador ---
    init: () => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                set({
                    isAuthenticated: true,
                    // --- AJUSTE: Le decimos a TypeScript que confíe en que los datos parseados son de tipo 'User' ---
                    user: JSON.parse(storedUser) as User,
                    error: null,
                    loading: false
                });
            }
        }
    }
  };
}

export const authStore = createAuthStore();
