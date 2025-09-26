// --- Tipos de Datos Principales (Nombres) ---

export interface User {
    id: number;
    uid?: string;
    fullName: string;
    email: string;
    roleId?: number;
    systemRole?: 'admin' | 'user'; 
    processRoles?: string[];
    avatarUrl?: string;
    status?: 'ACTIVE' | 'PENDING';
}

export interface ProcessRole {
    key: string; 
    name: string;
    description?: string;
}

// Sub-interfaz para una TaskInstance dentro de la respuesta del Proceso
export interface ProcessTaskInstance {
    id: number;
    status: string;
    completionTime: string | null;
    createdAt: string;
    comments: string | null;
    completionPayload: {
        comments?: string;
    };
    processElement: {
        name: string;
    };
    completedByUser: {
        fullName: string;
    } | null;
}
  
/**
 * Define la estructura detallada de una Instancia de Proceso, como la devuelve la API.
 */
export interface ProcessInstance {
    id: number;
    processDefId: number;
    description: string;
    status: string;
    businessData: Record<string, any>;
    startedByUserId: number;
    startTime: string;
    endTime: string | null;
    processDefinition: {
        id: number;
        businessProcessKey: string;
        name: string;
        description: string;
        version: number;
        status: string;
        bpmnProcessId: string;
    };
    startedByUser: {
        id: number;
        fullName: string;
        email: string;
    };
    taskInstances: ProcessTaskInstance[];
}

// Tarea principal para la lista / bandeja de entrada
export interface Task {
    taskId: number;
    taskName: string;
    processInstanceId: number;
    processName: string;
    processStartedBy: string;
    createdAt: string;
    dueDate: string | null;
}
  
export interface ProcessModel {
    id: string;
    name: string;
    description: string;
    version: string;
    bpmnXml: string;
}
  
// --- (El resto de los tipos de UI se mantienen igual) ---
  
export interface StatCard { value: number | string; label: string; icon: string; color: 'blue' | 'green' | 'red' | 'yellow'; }
export interface ChartDataItem { label: string; value: number; }
export interface DonutChartSegment { label: string; value: number; color: string; }
export interface ActivityItem { user: string; action: string; task: string; time: string; }
export interface SlowProcess { id: string; name: string; duration: string; bottleneck: string; }
export interface RecentModel { id: string; name: string; lastModified: string; editor: string; }
export interface UserTask { id: string; name: string; process: string; dueDate: string; }
export interface ModalConfig { title: string; message: string; onConfirm: () => void; }
export interface ToastNotification { id: number; message: string; type: 'success' | 'error'; duration?: number; }
export interface GeneralInfoItem { label: string; value: string; icon: string; }
export interface BusinessDataItem { label: string; value: string; }
export type TimelineStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
export interface TimelineStep { taskName: string; status: TimelineStatus; user: string; date: string | null; }
export interface Comment { user: string; text: string; date: string; avatar: string; }
export interface DocumentFile { name: string; type: 'pdf' | 'doc' | string; date: string; user: string; }
export interface DocumentGroup { taskName: string; files: DocumentFile[]; }
export interface ProcessMockData { generalInfo: GeneralInfoItem[]; businessData: BusinessDataItem[]; timeline: TimelineStep[]; comments: Comment[]; documents: DocumentGroup[]; }
export interface PreviousTaskContext { name: string; user: string; comment: string; }
export interface ProcessTypeCard { key: string; name: string; description: string; icon: string; }
