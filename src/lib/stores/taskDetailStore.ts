import { writable } from 'svelte/store';
import type { Task } from '$lib/types';

// 2. Definimos la "forma" que tendrá el estado de este store
interface TaskDetailState {
  isOpen: boolean;
  task: Task | null; // El estado 'task' debe ser un objeto 'Task' o nulo
}

// 3. Nos aseguramos de que nuestro estado inicial cumpla el contrato
const initialState: TaskDetailState = {
  isOpen: false,
  task: null,
};

// 4. Le decimos al store que siempre debe manejar un estado con la forma de 'TaskDetailState'
const { subscribe, set } = writable<TaskDetailState>(initialState);

export const taskDetailStore = {
  subscribe,
  // 5. Creamos un contrato para la función 'show': solo aceptará un parámetro que sea de tipo 'Task'
  show: (task: Task) => set({ isOpen: true, task }),
  hide: () => set(initialState),
};