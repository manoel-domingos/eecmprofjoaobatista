// Centralized type definitions

export type Severity = 'Leve' | 'Media' | 'Grave';
export type Shift = 'Matutino' | 'Vespertino' | 'Noturno';
export type BehaviorClass = 'Excepcional' | 'Ótimo' | 'Bom' | 'Regular' | 'Insuficiente' | 'Incompatível';
export type PraiseType = 'Individual' | 'Coletivo' | 'Art. 50' | 'Art. 51';
export type AppUserRole = 'GESTOR' | 'COORD' | 'MONITOR';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYSTEM';

export interface Student {
  id: string;
  name: string;
  class: string;
  shift: Shift;
  points: number;
  contacts?: { name: string; phone: string }[];
  observation?: string;
  address?: string;
  cpf?: string;
  registrationNumber?: string;
  birthDate?: string;
  archived?: boolean;
}

export interface DisciplineRule {
  code: number;
  description: string;
  severity: Severity;
  points: number;
  measure: string;
}

export interface Occurrence {
  id: string;
  studentId: string;
  studentIds?: string[];
  date: string;
  hour?: string;
  location?: string;
  locatedBy?: string;
  ruleCode: number;
  registeredBy: string;
  observations?: string;
  archived?: boolean;
  videoUrls?: string[];
  signedDocUrls?: string[];
  durationDays?: number;
  measure?: string;
  attenuatingFactors?: string[];
  aggravatingFactors?: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Monitor' | 'Professor' | 'Coord.' | 'Diretora' | 'G1' | 'G2';
}

export interface Accident {
  id: string;
  studentId: string;
  date: string;
  location: string;
  type: string;
  description: string;
  bodyPart: string;
  registeredBy: string;
  parentsNotified: boolean;
  medicForwarded: boolean;
  observations?: string;
  archived?: boolean;
}

export interface Praise {
  id: string;
  studentId: string;
  date: string;
  type: PraiseType;
  description: string;
  registeredBy: string;
  archived?: boolean;
}

export interface Summons {
  id: string;
  studentId: string;
  date: string;
  time: string;
  reason: string;
  department: string;
  registeredBy: string;
  archived?: boolean;
}

export interface ConductTerm {
  id: string;
  studentId: string;
  date: string;
  guardianName: string;
  commitments: string;
  registeredBy: string;
  archived?: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppUserRole;
}

export interface AuditLog {
  id: string;
  date: string;
  action: AuditAction;
  entityName: string;
  entityId: string;
  details: string;
  userEmail: string;
}

// Filter types for reusable hooks
export interface FilterState {
  searchTerm: string;
  classFilter: string;
  shiftFilter: string;
  dateFrom: string;
  dateTo: string;
  severityFilter: Severity | '';
  showArchived: boolean;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: '',
  classFilter: '',
  shiftFilter: '',
  dateFrom: '',
  dateTo: '',
  severityFilter: '',
  showArchived: false,
};

// Pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 20,
  total: 0,
};

// API Response types
export interface AIAnalysisResult {
  headerRowIndex: number;
  columns: {
    name?: string;
    class?: string;
    shift?: string;
    cpf?: string;
    birthDate?: string;
    phone1?: string;
    phone2?: string;
    registration?: string;
    observation?: string;
    mother?: string;
    father?: string;
  };
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Legacy types (keeping for backwards compatibility)
export interface FieldOption {
  value: string;
  label: string;
}

export interface AILog {
  model: string;
  provider: 'google' | 'groq' | 'openai' | 'gemini';
  prompt: string;
  response: string;
  status: 'success' | 'error';
  timestamp?: number;
}
