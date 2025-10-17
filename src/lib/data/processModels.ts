import type { ProcessModel } from '$lib/types';

// This file simulates a database of process definitions.
// Each object contains the process metadata and the Svelte Flow JSON.

export const processModels: ProcessModel[] = [
  {
    id: 'MODEL-001',
    name: 'Proceso de Solicitud de Compra',
    description: 'Flujo estándar para la adquisición de bienes y servicios.',
    version: '1.2',
    lastModified: '2023-11-10',
    // --- Svelte Flow JSON Structure ---
    flowJson: JSON.stringify({
      nodes: [
        {
          id: '1',
          type: 'startEvent',
          data: { label: 'Start' },
          position: { x: 50, y: 150 },
          width: 50,
          height: 50
        },
        {
          id: '2',
          type: 'userTask',
          data: {
            label: 'Review Request',
            assignedRoleId: 1,
            assignedRoleName: 'Analyst'
          },
          position: { x: 250, y: 125 },
          width: 154,
          height: 76
        },
        {
          id: '3',
          type: 'gateway',
          data: { label: '> $1000?' },
          position: { x: 500, y: 135 },
          width: 80,
          height: 80
        },
        {
          id: '4',
          type: 'userTask',
          data: {
            label: 'Approve Request',
            assignedRoleId: 2,
            assignedRoleName: 'Manager'
          },
          position: { x: 700, y: 50 },
          width: 154,
          height: 76
        },
        {
          id: '5',
          type: 'endEvent',
          data: { label: 'End' },
          position: { x: 900, y: 150 },
          width: 50,
          height: 50
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4', animated: true, label: 'Yes' },
        { id: 'e3-5', source: '3', target: '5', label: 'No' },
        { id: 'e4-5', source: '4', target: '5' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    })
  },
  {
    id: 'MODEL-002',
    name: 'Proceso de Solicitud de Vacaciones',
    description: 'Flujo para gestionar las solicitudes de vacaciones de los empleados.',
    version: '1.0',
    lastModified: '2023-10-15',
    flowJson: JSON.stringify({
      nodes: [
        {
          id: '1',
          type: 'startEvent',
          data: { label: 'Request Made' },
          position: { x: 50, y: 100 },
          width: 50,
          height: 50
        },
        {
          id: '2',
          type: 'userTask',
          data: {
            label: 'Supervisor Approval',
            assignedRoleId: 2,
            assignedRoleName: 'Manager'
          },
          position: { x: 250, y: 75 },
          width: 154,
          height: 76
        },
        {
          id: '3',
          type: 'endEvent',
          data: { label: 'Finished' },
          position: { x: 500, y: 100 },
          width: 50,
          height: 50
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    })
  }
];
