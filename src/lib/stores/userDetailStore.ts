import { writable } from 'svelte/store';
import type { User } from '../types';

interface UserDetailStore {
  isOpen: boolean;
  user: User | null; 
}

const { subscribe, update, set } = writable<UserDetailStore>({
  isOpen: false,
  user: null,
});

export const userDetailStore = {
  subscribe,
  show: (user: User | null) => update(store => ({
    ...store,
    isOpen: true,
    user: user
  })),
  hide: () => update(store => ({
    ...store,
    isOpen: false
  })),
  set,
};
