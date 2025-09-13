import type { User } from '../types';

export const users: User[] = [
  {
    uid: 'user-001',
    displayName: 'Ana García',
    email: 'ana.garcia@example.com',
    systemRole: 'admin',
    processRoles: ['approver', 'project_manager'],
    avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg'
  },
  {
    uid: 'user-002',
    displayName: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    systemRole: 'user',
    processRoles: ['finance_analyst'],
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    uid: 'user-003',
    displayName: 'Laura Martínez',
    email: 'laura.martinez@example.com',
    systemRole: 'user',
    processRoles: ['legal_reviewer'],
    avatarUrl: 'https://randomuser.me/api/portraits/women/48.jpg'
  },
  {
    uid: 'user-004',
    displayName: 'Javier López',
    email: 'javier.lopez@example.com',
    systemRole: 'user',
    processRoles: ['it_support'],
    avatarUrl: 'https://randomuser.me/api/portraits/men/50.jpg'
  }
];
