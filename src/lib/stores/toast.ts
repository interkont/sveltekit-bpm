import { writable } from 'svelte/store';
// --- AJUSTE: Importamos la 'interface' que define una notificación ---
import type { ToastNotification } from '$lib/types';

// --- AJUSTE: Se define el tipo para los datos que recibe la función addToast ---
// Usamos 'Omit' de TypeScript para crear un tipo basado en ToastNotification pero sin la propiedad 'id'.
type ToastPayload = Omit<ToastNotification, 'id'>;

// --- AJUSTE: Le decimos al store que manejará un array de 'ToastNotification' ---
const { subscribe, update } = writable<ToastNotification[]>([]);

// --- AJUSTE: Se tipa el parámetro de la función ---
function addToast(toast: ToastPayload) {
    // Generamos un ID único para la notificación
    const id = Date.now() + Math.random();
    
    // Añadimos la nueva notificación al array
    // TypeScript verifica que { id, ...toast } ahora cumple con la interface ToastNotification
    update(toasts => [...toasts, { id, ...toast }]);
    
    // Creamos un temporizador para eliminarla después de un tiempo
    setTimeout(() => removeToast(id), toast.duration || 4000);
}

// --- AJUSTE: Se tipa el parámetro de la función ---
function removeToast(id: number) {
    update(toasts => toasts.filter(t => t.id !== id));
}

// Exportamos un objeto que nuestra app puede usar
export const toast = {
    subscribe,
    // --- AJUSTE: Se tipan los parámetros de la función 'show' ---
    // Usamos ToastNotification['type'] para reutilizar los tipos que ya definimos.
    show: (message: string, type: ToastNotification['type'] = 'success', duration?: number) => {
        addToast({ message, type, duration });
    },
};