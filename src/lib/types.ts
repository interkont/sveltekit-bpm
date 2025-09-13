// --- Tipos de Datos Principales (Nombres) ---

/**
 * AJUSTE: Se modifica la interfaz de Usuario para separar roles de sistema y de proceso.
 */
export interface User {
    uid: string; // Identificador único, proveniente de Firebase Auth
    displayName: string;
    email: string;
    systemRole: 'admin' | 'user'; // Rol en la aplicación
    processRoles: string[]; // Array de keys de ProcessRole
    avatarUrl?: string;
}

/**
 * NUEVO: Define la estructura para un Rol de Proceso.
 */
export interface ProcessRole {
    key: string; // ej: 'project_manager'
    name: string; // ej: 'Gerente de Proyecto'
}
  
export interface ProcessInstance {
    id: string;
    processName: string;
    initiator: string;
    creationDate: string;
    status: string;
}

export interface Task {
    id: string;
    processName: string;
    taskName: string;
    // Añadimos el objeto de proceso completo que ya usábamos en los datos de maqueta
    process: ProcessInstance;
}
  
export interface ProcessModel {
    id: string;
    name: string;
    description: string;
    version: string;
    bpmnXml: string;
}
  
  
// --- Tipos de Datos para Componentes de UI y Stores ---
  
/**
 * Define la estructura de una tarjeta de estadística en el Dashboard.
 * Usado en: DashboardView.svelte
 */
export interface StatCard {
    value: number | string;
    label: string;
    icon: string;
    color: 'blue' | 'green' | 'red' | 'yellow';
}
  
/**
 * Define la estructura de un punto de datos para los gráficos de barras.
 * Usado en: DashboardView.svelte, SimpleBarChart.svelte
 */
export interface ChartDataItem {
    label: string;
    value: number;
}
  
/**
 * Define la estructura de un segmento para el gráfico de dona.
 * Usado en: DashboardView.svelte, DonutChart.svelte
 */
export interface DonutChartSegment {
    label: string;
    value: number;
    color: string;
}
  
/**
 * Define la estructura de un item en el feed de actividad reciente.
 * Usado en: DashboardView.svelte
 */
export interface ActivityItem {
    user: string;
    action: string;
    task: string;
    time: string;
}
  
/**
 * Define la estructura de los datos para la tabla de procesos lentos.
 * Usado en: DashboardView.svelte
 */
export interface SlowProcess {
      id: string;
      name: string;
      duration: string;
      bottleneck: string;
}
  
/**
 * Define la configuración para mostrar el modal de confirmación.
 * Usado en: modal.ts, App.svelte (ahora +layout.svelte)
 */
export interface ModalConfig {
    title: string;
    message: string;
    onConfirm: () => void;
}
  
/**
 * Define la estructura de una notificación Toast.
 * Usado en: toast.ts, Toast.svelte
 */
export interface ToastNotification {
    id: number;
    message: string;
    type: 'success' | 'error';
    duration?: number;
}

// --- Tipos para ProcessDetailView ---

export interface GeneralInfoItem {
  label: string;
  value: string;
  icon: string;
}

export interface BusinessDataItem {
  label: string;
  value: string;
}

export type TimelineStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';

export interface TimelineStep {
  taskName: string;
  status: TimelineStatus;
  user: string;
  date: string | null;
}

export interface Comment {
  user: string;
  text: string;
  date: string;
  avatar: string;
}

export interface DocumentFile {
  name: string;
  type: 'pdf' | 'doc' | string;
  date: string;
  user: string;
}

export interface DocumentGroup {
  taskName: string;
  files: DocumentFile[];
}

export interface ProcessMockData {
  generalInfo: GeneralInfoItem[];
  businessData: BusinessDataItem[];
  timeline: TimelineStep[];
  comments: Comment[];
  documents: DocumentGroup[];
}

export interface PreviousTaskContext {
  name: string;
  user: string;
  comment: string;
}

// --- AJUSTE: Se mantiene la interfaz anterior para el tipo de tarjeta de proceso ---
export interface ProcessTypeCard {
    key: string;
    name: string;
    description: string;
    icon: string;
}