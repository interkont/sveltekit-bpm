// --- Tipos de Datos Principales (Nombres) ---

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    uid?: string;
    fullName: string;
    email: string;
    status?: 'ACTIVE' | 'PENDING';
    createdAt: string;
    systemRole: string;
    roles: Role[];
    processRoles?: string[];
    avatarUrl?: string;
    modules?: string[];
}

export interface ProcessRole {
    id: number;
    key: string; 
    name: string;
    description?: string;
    users?: Partial<User>[];
}

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
  
export interface ProcessInstance {
    id: number;
    processDefId: number;
    description: string;
    status: string;
    businessData: Record<string, any>;
    businessDataFields?: FormFieldDefinition[];
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
    taskInstances?: ProcessTaskInstance[];
}

// Tarea principal para la lista / bandeja de entrada
export interface Task {
    taskId: number;
    taskName: string;
    processInstanceId: number;
    processDescription: string;
    processVersion: number;
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
    flowJson: string; 
    lastModified: string;
}

export interface ProcessDefinition {
    id: number;
    businessProcessKey: string;
    name: string;
    description: string;
    version: number;
    category: string | null;
    status: string;
    bpmnProcessId: string;
    createdAt: string;
    diagramJson?: Record<string, any>;
    elements?: ProcessElementPayload[];
}

// --- ADD: Type for the editable process definition data in the panel ---
export interface ProcessDefinitionData {
    name: string;
    description: string;
    category: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
    businessProcessKey: string;
}

// --- ADD: Types for API Payloads ---

export interface FormFieldPayload {
    id?: number;
    fieldDefId: number;
    displayOrder: number;
    isRequired: boolean;
    isReadonly: boolean;
    contextualValidations?: Record<string, any> | null;
    fieldDefinition?: FieldDefinition;
}

export interface ProcessElementPayload {
    bpmnElementId: string;
    name: string;
    description?: string;
    type: 'START_EVENT' | 'END_EVENT' | 'USER_TASK' | 'AUTO_TASK' | 'EXCLUSIVE_GATEWAY' | 'PARALLEL_GATEWAY';
    assignedRoleId?: number;
    webhook_target?: string;
    sla_definition?: string;
    formFields?: FormFieldPayload[];
    actions?: string[]; // Optional actions for USER_TASK
}

export interface SequenceFlowPayload {
    sourceElementBpmnId: string;
    targetElementBpmnId: string;
    conditionExpression?: string;
}

export interface ProcessDefinitionPayload extends ProcessDefinitionData {
    bpmnProcessId?: string;
    diagramJson: Record<string, any>;
    elements: ProcessElementPayload[];
    sequences: SequenceFlowPayload[];
}

export interface SaveActionResponse {
    action: 'UPDATE_IN_PLACE' | 'CREATE_NEW_VERSION';
    state: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'DEPRECATED';
    instancesCount: number;
}


// --- Tipos para Formularios Dinámicos ---

export interface FieldDefinition {
  id: number;
  name: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'DATE';
  validations: Record<string, any> | null;
}


export interface FormFieldDefinition {
    name: string;
    label: string;
    fieldType: 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'DATE';
    value: string | number | null;
    validations?: {
        isRequired: boolean;
        isReadonly: boolean;
    };
}

export interface StartFormDefinition {
    taskName: string;
    fields: FormFieldDefinition[];
    actions: string[];
}

export interface TaskFormDefinition extends StartFormDefinition {}

// --- (El resto de los tipos de UI se mantienen igual) ---
  
export interface StatCard { value: number | string; label: string; icon: string; color: 'blue' | 'green' | 'red' | 'yellow'; }
export interface ChartDataItem { label: string; value: number; }
export interface DonutChartSegment { label: string; value: number; color: string; }
export interface ActivityItem { user: string; action: string; task: string; time: string; }
export interface SlowProcess { id: string; name: string; duration: string; bottleneck: string; }
export interface RecentModel { id: string; name: string; lastModified: string; editor: string; }
export interface UserTask { id: string; name: string; process: string; dueDate: string; }
export interface ModalConfig { title: string; message: string; onConfirm: ()-› void; }
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
