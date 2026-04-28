// Supabase to App model mappers
// Centralized data transformation logic

import type { Occurrence, Accident, Praise, Summons, ConductTerm, AuditLog, Student } from './types';

// Student mapper
export function mapStudentFromDB(data: Record<string, unknown>): Student {
  return {
    id: data.id as string,
    name: data.name as string,
    class: data.class as string,
    shift: data.shift as Student['shift'],
    points: 8,
    contacts: data.contacts as Student['contacts'],
    observation: data.observation as string | undefined,
    address: data.address as string | undefined,
    cpf: data.cpf as string | undefined,
    registrationNumber: data.registration_number as string | undefined,
    birthDate: data.birth_date as string | undefined,
    archived: data.archived as boolean | undefined,
  };
}

// Occurrence mapper
export function mapOccurrenceFromDB(data: Record<string, unknown>): Occurrence {
  const ruleCode = Array.isArray(data.rule_code) 
    ? Number(data.rule_code[0]) 
    : Number(data.rule_code);

  return {
    id: data.id as string,
    date: data.date as string,
    hour: data.hour as string | undefined,
    location: data.location as string | undefined,
    locatedBy: data.located_by as string | undefined,
    ruleCode,
    studentId: String(data.student_id),
    studentIds: data.student_ids as string[] | undefined,
    registeredBy: data.registered_by as string,
    observations: data.observations as string | undefined,
    videoUrls: (data.video_urls as string[]) || (data.video_url ? [data.video_url as string] : []),
    signedDocUrls: (data.signed_doc_urls as string[]) || (data.signed_doc_url ? [data.signed_doc_url as string] : []),
    archived: (data.archived as boolean) || false,
    durationDays: data.duration_days as number | undefined,
    measure: data.measure as string | undefined,
    attenuatingFactors: data.attenuating_factors as string[] | undefined,
    aggravatingFactors: data.aggravating_factors as string[] | undefined,
  };
}

export function mapOccurrenceToDB(data: Partial<Occurrence>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  if (data.studentId) payload.student_id = data.studentId;
  if (data.studentIds) payload.student_ids = data.studentIds;
  if (data.date) payload.date = data.date;
  if (data.hour) payload.hour = data.hour;
  if (data.location) payload.location = data.location;
  if (data.locatedBy) payload.located_by = data.locatedBy;
  if (data.ruleCode) payload.rule_code = [data.ruleCode];
  if (data.registeredBy) payload.registered_by = data.registeredBy;
  if (data.observations !== undefined) payload.observations = data.observations;
  if (data.videoUrls) payload.video_urls = data.videoUrls;
  if (data.signedDocUrls) payload.signed_doc_urls = data.signedDocUrls;
  if (data.durationDays !== undefined) payload.duration_days = data.durationDays;
  if (data.measure) payload.measure = data.measure;
  if (data.attenuatingFactors) payload.attenuating_factors = data.attenuatingFactors;
  if (data.aggravatingFactors) payload.aggravating_factors = data.aggravatingFactors;
  
  return payload;
}

// Accident mapper
export function mapAccidentFromDB(data: Record<string, unknown>): Accident {
  return {
    id: data.id as string,
    studentId: data.student_id as string,
    date: data.date as string,
    location: data.location as string,
    type: data.type as string,
    description: data.description as string,
    bodyPart: data.body_part as string,
    registeredBy: data.registered_by as string,
    parentsNotified: data.parents_notified as boolean,
    medicForwarded: data.medic_forwarded as boolean,
    observations: data.observations as string | undefined,
    archived: data.archived as boolean | undefined,
  };
}

export function mapAccidentToDB(data: Partial<Accident>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  if (data.studentId) payload.student_id = data.studentId;
  if (data.date) payload.date = data.date;
  if (data.location) payload.location = data.location;
  if (data.type) payload.type = data.type;
  if (data.description) payload.description = data.description;
  if (data.bodyPart) payload.body_part = data.bodyPart;
  if (data.registeredBy) payload.registered_by = data.registeredBy;
  if (data.parentsNotified !== undefined) payload.parents_notified = data.parentsNotified;
  if (data.medicForwarded !== undefined) payload.medic_forwarded = data.medicForwarded;
  if (data.observations !== undefined) payload.observations = data.observations;
  
  return payload;
}

// Praise mapper
export function mapPraiseFromDB(data: Record<string, unknown>): Praise {
  return {
    id: data.id as string,
    studentId: data.student_id as string,
    date: data.date as string,
    type: (data.article || data.type) as Praise['type'],
    description: data.description as string,
    registeredBy: data.registered_by as string,
    archived: data.archived as boolean | undefined,
  };
}

export function mapPraiseToDB(data: Partial<Praise>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  if (data.studentId) payload.student_id = data.studentId;
  if (data.date) payload.date = data.date;
  if (data.type) payload.article = data.type;
  if (data.description) payload.description = data.description;
  if (data.registeredBy) payload.registered_by = data.registeredBy;
  
  return payload;
}

// Summons mapper
export function mapSummonsFromDB(data: Record<string, unknown>): Summons {
  return {
    id: data.id as string,
    studentId: data.student_id as string,
    date: data.date as string,
    time: data.time as string,
    reason: data.reason as string,
    department: data.department as string,
    registeredBy: data.registered_by as string,
    archived: data.archived as boolean | undefined,
  };
}

export function mapSummonsToDB(data: Partial<Summons>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  if (data.studentId) payload.student_id = data.studentId;
  if (data.date) payload.date = data.date;
  if (data.time) payload.time = data.time;
  if (data.reason) payload.reason = data.reason;
  if (data.department) payload.department = data.department;
  if (data.registeredBy) payload.registered_by = data.registeredBy;
  
  return payload;
}

// ConductTerm mapper
export function mapConductTermFromDB(data: Record<string, unknown>): ConductTerm {
  return {
    id: data.id as string,
    studentId: data.student_id as string,
    date: data.date as string,
    guardianName: data.guardian_name as string,
    commitments: data.commitments as string,
    registeredBy: data.registered_by as string,
    archived: data.archived as boolean | undefined,
  };
}

export function mapConductTermToDB(data: Partial<ConductTerm>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  if (data.studentId) payload.student_id = data.studentId;
  if (data.date) payload.date = data.date;
  if (data.guardianName) payload.guardian_name = data.guardianName;
  if (data.commitments) payload.commitments = data.commitments;
  if (data.registeredBy) payload.registered_by = data.registeredBy;
  
  return payload;
}

// AuditLog mapper
export function mapAuditLogFromDB(data: Record<string, unknown>): AuditLog {
  return {
    id: data.id as string,
    date: data.date as string,
    action: data.action as AuditLog['action'],
    entityName: data.entity_name as string,
    entityId: data.entity_id as string,
    details: data.details as string,
    userEmail: data.user_email as string,
  };
}

export function mapAuditLogToDB(data: Omit<AuditLog, 'id'>): Record<string, unknown> {
  return {
    date: data.date,
    action: data.action,
    entity_name: data.entityName,
    entity_id: data.entityId,
    details: data.details,
    user_email: data.userEmail,
  };
}
