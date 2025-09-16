import type { ProcessRole } from '../types';

export const processRoles: ProcessRole[] = [
  {
    key: 'approver',
    name: 'Aprobador',
    description: 'Responsable de dar el visto bueno final a las solicitudes o etapas críticas del proceso.'
  },
  {
    key: 'project_manager',
    name: 'Gerente de Proyecto',
    description: 'Coordina y supervisa todas las fases del proceso para asegurar que se cumplan los objetivos.'
  },
  {
    key: 'finance_analyst',
    name: 'Analista Financiero',
    description: 'Evalúa el impacto financiero y la viabilidad de las propuestas dentro del proceso.'
  },
  {
    key: 'legal_reviewer',
    name: 'Revisor Legal',
    description: 'Garantiza que todas las acciones y documentos del proceso cumplan con la normativa legal.'
  },
  {
    key: 'it_support',
    name: 'Soporte de TI',
    description: 'Proporciona asistencia técnica y gestiona los sistemas implicados en el proceso.'
  }
];
