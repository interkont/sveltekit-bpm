import { readable } from 'svelte/store';
import type { ProcessRole } from '../types';
import { processRoles as mockProcessRoles } from '../data/process-roles';

// Creamos un store "readable" porque por ahora la lista de roles es fija.
// Si en el futuro permitimos crear/editar roles, lo cambiaremos a "writable".
export const processRoleStore = readable<ProcessRole[]>(mockProcessRoles);
