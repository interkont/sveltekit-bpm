import { writable } from 'svelte/store';
import type { User } from '../types';
import { users as mockUsers } from '../data/users';

const { subscribe, set, update } = writable<User[]>(mockUsers);

export const userStore = {
  subscribe,
  // Futuras acciones (add, update, delete) irán aquí
};
