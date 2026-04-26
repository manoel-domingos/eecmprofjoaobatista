'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { 
  Student, Occurrence, Accident, Praise, DisciplineRule, Summons, ConductTerm, AuditLog, StaffMember, AppUser, AppUserRole,
  INITIAL_STUDENTS, INITIAL_OCCURRENCES, INITIAL_ACCIDENTS, INITIAL_PRAISES, INITIAL_RULES
} from './data';

interface AppState {
  students: Student[];
  occurrences: Occurrence[];
  accidents: Accident[];
  praises: Praise[];
  rules: DisciplineRule[];
  summons: Summons[];
  conductTerms: ConductTerm[];
  auditLogs: AuditLog[];
  staffMembers: StaffMember[];
  appUsers: AppUser[];
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  user: any | null;
  isGuest: boolean;
  currentUserRole: AppUserRole | 'GUEST';
  isAuthRestored: boolean;
  isDebugMode: boolean;
  geminiApiKey: string;
  groqApiKey: string;
  setIsDebugMode: (v: boolean) => void;
  setGeminiApiKey: (v: string) => void;
  setGroqApiKey: (v: string) => void;
  setGuestMode: () => void;
  setMockUser: (username: string) => void;
  logout: () => Promise<void>;
}

interface AppContextType extends AppState {
  logAction: (action: AuditLog['action'], entityName: string, entityId: string, details: string) => Promise<void>;
  
  addAppUser: (u: Omit<AppUser, 'id'>) => Promise<void>;
  updateAppUser: (id: string, u: Partial<AppUser>) => Promise<void>;
  deleteAppUser: (id: string) => Promise<void>;

  addStudent: (s: Omit<Student, 'id'>) => Promise<void>;
  importStudents: (newStudents: Omit<Student, 'id'>[]) => Promise<void>;
  updateStudent: (id: string, s: Partial<Student>) => Promise<void>;
  archiveStudent: (id: string) => Promise<void>;
  restoreStudent: (id: string) => Promise<void>;
  deleteAllStudents: () => Promise<void>;
  refreshData: () => Promise<void>;

  addOccurrence: (o: Omit<Occurrence, 'id'>) => Promise<void>;
  updateOccurrence: (id: string, o: Partial<Occurrence>) => Promise<void>;
  archiveOccurrence: (id: string) => Promise<void>;
  restoreOccurrence: (id: string) => Promise<void>;
  
  addAccident: (a: Omit<Accident, 'id'>) => Promise<void>;
  updateAccident: (id: string, a: Partial<Accident>) => Promise<void>;
  archiveAccident: (id: string) => Promise<void>;
  restoreAccident: (id: string) => Promise<void>;
  
  addPraise: (p: Omit<Praise, 'id'>) => Promise<void>;
  updatePraise: (id: string, p: Partial<Praise>) => Promise<void>;
  archivePraise: (id: string) => Promise<void>;
  restorePraise: (id: string) => Promise<void>;

  addSummons: (s: Omit<Summons, 'id'>) => Promise<void>;
  updateSummons: (id: string, s: Partial<Summons>) => Promise<void>;
  archiveSummons: (id: string) => Promise<void>;
  restoreSummons: (id: string) => Promise<void>;

  addConductTerm: (t: Omit<ConductTerm, 'id'>) => Promise<void>;
  updateConductTerm: (id: string, t: Partial<ConductTerm>) => Promise<void>;
  archiveConductTerm: (id: string) => Promise<void>;
  restoreConductTerm: (id: string) => Promise<void>;

  updateRule: (code: number, r: Partial<DisciplineRule>) => Promise<void>;
  addStaffMember: (s: Omit<StaffMember, 'id'>) => Promise<void>;
  
  getStudentPoints: (studentId: string) => number;
  getStudentBehavior: (points: number) => string;
  getStudentOccurrences: (studentId: string) => Occurrence[];
  checkRecidivism: (studentId: string, ruleCode: number) => boolean;
  getEscalationStatus: (studentId: string, ruleCode: number) => { isEscalated: boolean, reason: string, measure: string, severity: string };
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 'ST1', role: 'Monitor', name: 'Murillo' },
  { id: 'ST2', role: 'Monitor', name: 'Proença' },
  { id: 'ST3', role: 'Monitor', name: 'George' },
  { id: 'ST4', role: 'Coord.', name: 'Joana' },
  { id: 'ST5', role: 'Coord.', name: 'Djeovani' },
  { id: 'ST6', role: 'G2', name: 'Maykon' },
  { id: 'ST7', role: 'G1', name: 'Manoel' },
  { id: 'ST8', role: 'Diretora', name: 'Edma' },
];

const INITIAL_APP_USERS: AppUser[] = [
  { id: 'U1', email: 'manoeldomingos2@gmail.com', name: 'Manoel', role: 'GESTOR' },
  { id: 'U2', email: 'manoel', name: 'Manoel (Mock)', role: 'GESTOR' },
  { id: 'U3', email: 'maykon', name: 'Maykon', role: 'GESTOR' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [praises, setPraises] = useState<Praise[]>([]);
  const [rules, setRules] = useState<DisciplineRule[]>(INITIAL_RULES); // keep the rules
  const [summons, setSummons] = useState<Summons[]>([]);
  const [conductTerms, setConductTerms] = useState<ConductTerm[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [appUsers, setAppUsers] = useState<AppUser[]>(INITIAL_APP_USERS);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<AppUserRole | 'GUEST'>('GUEST');
  const [isAuthRestored, setIsAuthRestored] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');

  useEffect(() => {
    const storedDebug = localStorage.getItem('eecm_debug_mode');
    if (storedDebug === 'true') setIsDebugMode(true);
    
    const storedGemini = localStorage.getItem('eecm_gemini_key');
    if (storedGemini) setGeminiApiKey(storedGemini);
    
    const storedGroq = localStorage.getItem('eecm_groq_key');
    if (storedGroq) setGroqApiKey(storedGroq);
  }, []);

  useEffect(() => {
    localStorage.setItem('eecm_debug_mode', isDebugMode.toString());
  }, [isDebugMode]);

  useEffect(() => {
    if (geminiApiKey) localStorage.setItem('eecm_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    if (groqApiKey) localStorage.setItem('eecm_groq_key', groqApiKey);
  }, [groqApiKey]);
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('eecm_app_users');
      if (storedUsers) {
        setAppUsers(JSON.parse(storedUsers));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (appUsers.length > 0) {
      localStorage.setItem('eecm_app_users', JSON.stringify(appUsers));
    }
  }, [appUsers]);

  useEffect(() => {
    if (isGuest) {
      setCurrentUserRole('GUEST');
    } else if (user && user.email) {
      const matched = appUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (matched) {
        setCurrentUserRole(matched.role);
      } else {
        setCurrentUserRole('COORD'); // Defaulting unknown actual logged-in users to COORD
      }
    } else {
      setCurrentUserRole('GUEST');
    }
  }, [user, isGuest, appUsers]);

  useEffect(() => {
    async function initAuthAndData() {
      let usingMockSession = false;
      // Restore session from localStorage if within 10 minutes
      try {
        const stored = localStorage.getItem('eecm_session');
        if (stored) {
          const { type, email, timestamp } = JSON.parse(stored);
          const now = Date.now();
          const TEN_MINUTES = 10 * 60 * 1000;
          
          if (now - timestamp < TEN_MINUTES) {
            if (type === 'mock') {
              setUser({ email, role: 'admin' });
              setIsGuest(false);
              // Refresh timestamp to extend session on F5
              localStorage.setItem('eecm_session', JSON.stringify({ type, email, timestamp: now }));
              usingMockSession = true;
            } else if (type === 'guest') {
              setIsGuest(true);
              setUser(null);
              // Refresh timestamp
              localStorage.setItem('eecm_session', JSON.stringify({ type, timestamp: now }));
              usingMockSession = true;
            }
          } else {
            localStorage.removeItem('eecm_session');
          }
        }
      } catch (err) {
        console.error("Failed to restore session", err);
      }

      if (!supabase) {
        setIsAuthRestored(true);
        return;
      }

      if (!usingMockSession) {
        // Check session
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }
        } catch (e) {
          console.error("Failed to get supabase session", e);
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });
      }

      setIsAuthRestored(true);

      const fetchData = async () => {
        if (!supabase) return;
        setIsSyncing(true);
        try {
          const responses = await Promise.all([
            supabase!.from('students').select('*'),
            supabase!.from('rules').select('*'),
            supabase!.from('occurrences').select('*').order('date', { ascending: false }),
            supabase!.from('accidents').select('*').order('date', { ascending: false }),
            supabase!.from('praises').select('*').order('date', { ascending: false }),
            supabase!.from('summons').select('*').order('date', { ascending: false }),
            supabase!.from('conduct_terms').select('*').order('date', { ascending: false }),
            supabase!.from('audit_logs').select('*').order('date', { ascending: false })
          ]);

          const [
            { data: studentsData },
            { data: rulesData },
            { data: occurrencesData },
            { data: accidentsData },
            { data: praisesData },
            { data: summonsData },
            { data: conductTermsData },
            { data: auditLogsData }
          ] = responses;

          if (studentsData) {
            setIsSupabaseConnected(true);
            setStudents(studentsData.map(s => ({ ...s, points: 8 }))); 
          }
          if (rulesData) setRules(rulesData.map(r => ({ ...r, ruleCode: r.code })));
          if (occurrencesData) setOccurrences(occurrencesData.map((o: any) => ({
            id: o.id,
            date: o.date,
            hour: o.hour,
            location: o.location,
            locatedBy: o.located_by,
            ruleCode: Number(o.rule_code), 
            studentId: String(o.student_id), 
            registeredBy: o.registered_by,
            observations: o.observations,
            videoUrls: o.video_urls || (o.video_url ? [o.video_url] : []),
            signedDocUrls: o.signed_doc_urls || (o.signed_doc_url ? [o.signed_doc_url] : []),
            archived: o.archived || false
          })));
          if (accidentsData) setAccidents(accidentsData.map(a => ({...a, studentId: a.student_id, registeredBy: a.registered_by, bodyPart: a.body_part, parentsNotified: a.parents_notified, medicForwarded: a.medic_forwarded})));
          if (praisesData) setPraises(praisesData.map(p => ({...p, studentId: p.student_id, registeredBy: p.registered_by})));
          if (summonsData) setSummons(summonsData.map((s: any) => ({...s, studentId: s.student_id, registeredBy: s.registered_by})));
          if (conductTermsData) setConductTerms(conductTermsData.map((t: any) => ({...t, studentId: t.student_id, registeredBy: t.registered_by, guardianName: t.guardian_name})));
          if (auditLogsData) setAuditLogs(auditLogsData.map((l: any) => ({...l, entityName: l.entity_name, entityId: l.entity_id, userEmail: l.user_email})));
        } catch (err) {
          console.error("Initial data fetch failed", err);
        } finally {
          setIsSyncing(false);
        }
      };

      await fetchData();

      // Real-time Subscriptions
      const tables = ['students', 'occurrences', 'accidents', 'praises', 'summons', 'conduct_terms', 'audit_logs', 'rules'];
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          console.log('Change detected, refreshing data...');
          fetchData();
        })
        .subscribe();

      return () => {
        if (supabase) supabase.removeChannel(channel);
      };
    }
    
    initAuthAndData();
  }, []);

  const logAction = async (action: AuditLog['action'], entityName: string, entityId: string, details: string) => {
    const userEmail = user?.email || (isGuest ? 'Somente Leitura' : 'Gestor Escolar');
    
    // Default system log logic
    const newLog: Omit<AuditLog, 'id'> = {
      date: new Date().toISOString(),
      action,
      entityName,
      entityId,
      details,
      userEmail
    };

    if (supabase && isSupabaseConnected) {
      try {
        const { data, error } = await supabase!.from('audit_logs').insert([{
          date: newLog.date,
          action: newLog.action,
          entity_name: newLog.entityName,
          entity_id: newLog.entityId,
          details: newLog.details,
          user_email: newLog.userEmail
        }]).select().single();
        
        if (!error && data) {
          setAuditLogs(prev => [{...data, entityName: data.entity_name, entityId: data.entity_id, userEmail: data.user_email}, ...prev]);
          return;
        }
      } catch (err) {
        console.error('Audit log failed', err);
      }
    }
    setAuditLogs(prev => [{ ...newLog, id: `LOG${prev.length + 1}` }, ...prev]);
  };

  const checkWriteAccess = () => {
    if (currentUserRole === 'GUEST') {
      alert('Acesso Negado: Você tem permissão de Somente Leitura. Operação cancelada.');
      throw new Error('Acesso Somente Leitura');
    }
  };

  const addAppUser = async (u: Omit<AppUser, 'id'>) => {
    if (currentUserRole !== 'GESTOR') {
      alert('Acesso Negado: Apenas gestores podem gerenciar usuários.');
      return;
    }
    const newId = `U${appUsers.length + 1}`;
    setAppUsers(prev => [...prev, { ...u, id: newId }]);
  };

  const updateAppUser = async (id: string, u: Partial<AppUser>) => {
    if (currentUserRole !== 'GESTOR') return;
    setAppUsers(prev => prev.map(item => item.id === id ? { ...item, ...u } : item));
  };

  const deleteAppUser = async (id: string) => {
    if (currentUserRole !== 'GESTOR') return;
    setAppUsers(prev => prev.filter(item => item.id !== id));
  };

  const addStudent = async (s: Omit<Student, 'id'>) => {
    checkWriteAccess();
    let newId = `S${students.length + 1}`;
    if (supabase && isSupabaseConnected) {
      try {
        const { data, error } = await supabase!.from('students').insert([s]).select().single();
        if (error) throw error;
        if (data) {
          setStudents(prev => [...prev, { ...data, points: 8 }]);
          newId = data.id;
          logAction('CREATE', 'Aluno', newId, `Adicionado aluno: ${s.name}`);
          return;
        }
      } catch (err: any) {
        console.error("Supabase insert error (student):", err);
        alert(`Erro ao salvar no banco de dados: ${err.message || JSON.stringify(err)}`);
        return;
      }
    }
    setStudents(prev => [...prev, { ...s, id: newId, points: 8 }]);
    logAction('CREATE', 'Aluno', newId, `Adicionado aluno (LOCAL): ${s.name}`);
  };

  const importStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      try {
        // Intelligence: Check for existing students to preserve IDs and avoid duplicates
        const { data: existingStudents } = await supabase!.from('students').select('id, name, class');
        
        const studentsToUpsert = newStudents.map(ns => {
          // Try to find a match by exact name and class if matched in DB
          if (existingStudents) {
             const match = existingStudents.find(es => 
               es.name.toLowerCase().trim() === ns.name.toLowerCase().trim() && 
               es.class.toLowerCase().trim() === ns.class.toLowerCase().trim()
             );
             if (match) {
                return { ...ns, id: match.id };
             }
          }
          return { ...ns, id: crypto.randomUUID() };
        });

        const { data, error } = await supabase!.from('students').upsert(studentsToUpsert, { onConflict: 'id' }).select();
        if (error) {
          console.error("Import error details:", error);
          alert(`Erro na importação: ${error.message}`);
          return;
        }
        if (data) {
          const mapped = data.map((d: any) => ({ ...d, points: 8 }));
          // Refresh the whole list to ensure correctness
          await refreshData();
          logAction('SYSTEM', 'Aluno', 'LOTE', `Importados/Atualizados ${mapped.length} alunos`);
        }
      } catch (err) {
        console.error("Detailed import exception:", err);
        alert('Falha crítica na comunicação com o servidor durante a importação.');
      }
      return;
    }
    
    const mappedLocal = newStudents.map((s, idx) => ({ ...s, id: `S${Date.now()}_${idx}` }));
    setStudents(prev => [...prev, ...mappedLocal]);
    logAction('SYSTEM', 'Aluno', 'LOTE', `Importados ${mappedLocal.length} alunos localmente`);
  };

  const updateStudent = async (id: string, s: Partial<Student>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      try {
        const { error } = await supabase!.from('students').update(s).eq('id', id);
        if (error) throw error;
        // The real-time subscription will handle the local state update eventually, 
        // but we keep the optimistic update for UI responsiveness.
      } catch (err) {
        console.error("Update error:", err);
      }
    }
    setStudents(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
    logAction('UPDATE', 'Aluno', id, `Atualizado aluno: ${s.name || id}`);
  };

  const archiveStudent = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setStudents(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Aluno', id, `Arquivado aluno: ${id}`);
  };

  const restoreStudent = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setStudents(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Aluno', id, `Restaurado aluno: ${id}`);
  };

  const addStaffMember = async (s: Omit<StaffMember, 'id'>) => {
    if (currentUserRole !== 'GESTOR') {
      alert('Acesso Negado: Apenas gestores podem gerenciar membros da equipe.');
      return;
    }
    const newId = `ST${staffMembers.length + 1}`;
    setStaffMembers(prev => [...prev, { ...s, id: newId }]);
    logAction('CREATE', 'Membro Equipe', newId, `Adicionado membro: ${s.role} ${s.name}`);
  };

  const refreshData = async () => {
    if (!supabase || !isSupabaseConnected) return;
    setIsSyncing(true);
    try {
      const responses = await Promise.all([
        supabase!.from('students').select('*'),
        supabase!.from('occurrences').select('*').order('date', { ascending: false }),
        supabase!.from('accidents').select('*').order('date', { ascending: false }),
        supabase!.from('praises').select('*').order('date', { ascending: false }),
        supabase!.from('summons').select('*').order('date', { ascending: false }),
        supabase!.from('conduct_terms').select('*').order('date', { ascending: false }),
        supabase!.from('audit_logs').select('*').order('date', { ascending: false })
      ]);
      
      const [
        { data: studentsData },
        { data: occurrencesData },
        { data: accidentsData },
        { data: praisesData },
        { data: summonsData },
        { data: conductTermsData },
        { data: auditLogsData }
      ] = responses;

      if (studentsData) setStudents(studentsData.map(s => ({ ...s, points: 8 })));
      if (occurrencesData) setOccurrences(occurrencesData.map((o: any) => ({
        id: o.id,
        date: o.date,
        hour: o.hour,
        location: o.location,
        locatedBy: o.located_by,
        ruleCode: Number(o.rule_code), 
        studentId: String(o.student_id), 
        registeredBy: o.registered_by,
        observations: o.observations,
        videoUrls: o.video_urls || (o.video_url ? [o.video_url] : []),
        signedDocUrls: o.signed_doc_urls || (o.signed_doc_url ? [o.signed_doc_url] : []),
        archived: o.archived || false
      })));
      if (accidentsData) setAccidents(accidentsData.map(a => ({...a, studentId: a.student_id, registeredBy: a.registered_by, bodyPart: a.body_part, parentsNotified: a.parents_notified, medicForwarded: a.medic_forwarded})));
      if (praisesData) setPraises(praisesData.map(p => ({...p, studentId: p.student_id, registeredBy: p.registered_by})));
      if (summonsData) setSummons(summonsData.map((s: any) => ({...s, studentId: s.student_id, registeredBy: s.registered_by})));
      if (conductTermsData) setConductTerms(conductTermsData.map((t: any) => ({...t, studentId: t.student_id, registeredBy: t.registered_by, guardianName: t.guardian_name})));
      if (auditLogsData) setAuditLogs(auditLogsData.map((l: any) => ({...l, entityName: l.entity_name, entityId: l.entity_id, userEmail: l.user_email})));
      
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteAllStudents = async () => {
    checkWriteAccess();
    if (currentUserRole !== 'GESTOR') {
      alert('Acesso Negado: Apenas gestores podem realizar esta ação destrutiva.');
      return;
    }
    if (supabase && isSupabaseConnected) {
      try {
        // Exclui em massa se possível
        const { error } = await supabase!.from('students').delete().neq('id', 'placeholder_id_to_allow_mass_delete');
        if (error) {
           // Se o delete em massa for bloqueado, tenta excluir um por um os que estão no estado local
           console.warn("Mass delete failed, trying sequential delete...", error);
           for (const student of students) {
             await supabase!.from('students').delete().eq('id', student.id);
           }
        }
      } catch (err) {
        console.error("Delete all exception:", err);
        alert('Falha crítica ao tentar apagar os alunos do servidor. Tente atualizar a página.');
        return;
      }
    }
    setStudents([]);
    logAction('DELETE', 'Aluno', 'ALL', 'Todos os alunos foram excluídos');
  };

  const addOccurrence = async (o: Omit<Occurrence, 'id'>) => {
    checkWriteAccess();
    let newId = `O${occurrences.length + 1}`;
    if (supabase && isSupabaseConnected) {
      const dbPayload = {
        student_id: o.studentId,
        date: o.date,
        hour: o.hour,
        location: o.location,
        located_by: o.locatedBy,
        rule_code: o.ruleCode,
        registered_by: o.registeredBy,
        observations: o.observations,
        video_urls: o.videoUrls,
        signed_doc_urls: o.signedDocUrls
      };
      try {
        const { data, error } = await supabase!.from('occurrences').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) {
          setOccurrences(prev => [{
            id: data.id,
            date: data.date,
            hour: data.hour,
            location: data.location,
            locatedBy: data.located_by,
            ruleCode: Number(data.rule_code), 
            studentId: String(data.student_id), 
            registeredBy: data.registered_by,
            observations: data.observations,
            videoUrls: data.video_urls || (data.video_url ? [data.video_url] : []),
            signedDocUrls: data.signed_doc_urls || (data.signed_doc_url ? [data.signed_doc_url] : []),
            archived: data.archived || false
          }, ...prev]);
          newId = data.id;
          logAction('CREATE', 'Ocorrência', newId, `Adicionada ocorrência para o aluno ID: ${o.studentId} (Art. ${o.ruleCode})`);
          return;
        }
      } catch (err: any) {
        console.error("Occurrence insert error:", err);
        // alert(`Erro ao salvar ocorrência no servidor: ${err.message}`);
        // fallback to local for now if columns missing
      }
    }
    setOccurrences(prev => [{ ...o, id: newId }, ...prev]);
    logAction('CREATE', 'Ocorrência', newId, `Adicionada ocorrência (LOCAL) para o aluno ID: ${o.studentId} (Art. ${o.ruleCode})`);
  };

  const updateOccurrence = async (id: string, o: Partial<Occurrence>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {};
      if (o.studentId) dbPayload.student_id = o.studentId;
      if (o.date) dbPayload.date = o.date;
      if (o.hour) dbPayload.hour = o.hour;
      if (o.location) dbPayload.location = o.location;
      if (o.locatedBy) dbPayload.located_by = o.locatedBy;
      if (o.ruleCode) dbPayload.rule_code = o.ruleCode;
      if (o.registeredBy) dbPayload.registered_by = o.registeredBy;
      if (o.observations !== undefined) dbPayload.observations = o.observations;
      if (o.videoUrls) dbPayload.video_urls = o.videoUrls;
      if (o.signedDocUrls) dbPayload.signed_doc_urls = o.signedDocUrls;
      
      try {
        const { error } = await supabase!.from('occurrences').update(dbPayload).eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error("Occurrence update error:", err);
        alert(`Erro ao atualizar ocorrência no servidor: ${err.message}`);
        return;
      }
    }
    setOccurrences(prev => prev.map(item => item.id === id ? { ...item, ...o } : item));
    logAction('UPDATE', 'Ocorrência', id, `Atualizada ocorrência ${id}`);
  };

  const archiveOccurrence = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setOccurrences(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Ocorrência', id, `Arquivada ocorrência ${id}`);
  };

  const restoreOccurrence = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setOccurrences(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Ocorrência', id, `Restaurada ocorrência ${id}`);
  };

  const addAccident = async (a: Omit<Accident, 'id'>) => {
    checkWriteAccess();
    let newId = `A${accidents.length + 1}`;
    if (supabase && isSupabaseConnected) {
       const dbPayload = {
        student_id: a.studentId,
        date: a.date,
        location: a.location,
        type: a.type,
        description: a.description,
        body_part: a.bodyPart,
        registered_by: a.registeredBy,
        parents_notified: a.parentsNotified,
        medic_forwarded: a.medicForwarded,
        observations: a.observations
      };
      try {
        const { data, error } = await supabase!.from('accidents').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) {
          setAccidents(prev => [{...data, studentId: data.student_id, registeredBy: data.registered_by, bodyPart: data.body_part, parentsNotified: data.parents_notified, medicForwarded: data.medic_forwarded}, ...prev]);
          newId = data.id;
          logAction('CREATE', 'Acidente', newId, `Adicionado acidente para o aluno ID: ${a.studentId}`);
          return;
        }
      } catch (err: any) {
        console.error("Accident insert error:", err);
        alert(`Erro ao salvar acidente no servidor: ${err.message}`);
        return;
      }
    }
    setAccidents(prev => [{ ...a, id: newId }, ...prev]);
    logAction('CREATE', 'Acidente', newId, `Adicionado acidente (LOCAL) para o aluno ID: ${a.studentId}`);
  };

  const updateAccident = async (id: string, a: Partial<Accident>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {};
      if (a.studentId) dbPayload.student_id = a.studentId;
      if (a.date) dbPayload.date = a.date;
      if (a.location) dbPayload.location = a.location;
      if (a.type) dbPayload.type = a.type;
      if (a.description) dbPayload.description = a.description;
      if (a.bodyPart) dbPayload.body_part = a.bodyPart;
      if (a.registeredBy) dbPayload.registered_by = a.registeredBy;
      if (a.parentsNotified !== undefined) dbPayload.parents_notified = a.parentsNotified;
      if (a.medicForwarded !== undefined) dbPayload.medic_forwarded = a.medicForwarded;
      if (a.observations !== undefined) dbPayload.observations = a.observations;

      await supabase!.from('accidents').update(dbPayload).eq('id', id);
    }
    setAccidents(prev => prev.map(item => item.id === id ? { ...item, ...a } : item));
    logAction('UPDATE', 'Acidente', id, `Atualizado acidente ${id}`);
  };

  const archiveAccident = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setAccidents(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Acidente', id, `Arquivado acidente ${id}`);
  };

  const restoreAccident = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setAccidents(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Acidente', id, `Restaurado acidente ${id}`);
  };

  const addPraise = async (p: Omit<Praise, 'id'>) => {
    checkWriteAccess();
    let newId = `P${praises.length + 1}`;
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {
        student_id: p.studentId,
        date: p.date,
        article: p.type,
        description: p.description,
        registered_by: p.registeredBy
      };
      try {
        const { data, error } = await supabase!.from('praises').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) {
          setPraises(prev => [{ ...data, studentId: data.student_id, registeredBy: data.registered_by }, ...prev]);
          newId = data.id;
          logAction('CREATE', 'Elogio', newId, `Adicionado elogio para o aluno ID: ${p.studentId}`);
          return;
        }
      } catch (err: any) {
        console.error("Praise insert error:", err);
        alert(`Erro ao salvar elogio no servidor: ${err.message}`);
        return;
      }
    }
    setPraises(prev => [{ ...p, id: newId }, ...prev]);
    logAction('CREATE', 'Elogio', newId, `Adicionado elogio (LOCAL) para o aluno ID: ${p.studentId}`);
  };

  const updatePraise = async (id: string, p: Partial<Praise>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {};
      if (p.studentId) dbPayload.student_id = p.studentId;
      if (p.date) dbPayload.date = p.date;
      if (p.type) dbPayload.article = p.type;
      if (p.description) dbPayload.description = p.description;
      if (p.registeredBy) dbPayload.registered_by = p.registeredBy;

      await supabase!.from('praises').update(dbPayload).eq('id', id);
    }
    setPraises(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
    logAction('UPDATE', 'Elogio', id, `Atualizado elogio ${id}`);
  };

  const archivePraise = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setPraises(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Elogio', id, `Arquivado elogio ${id}`);
  };

  const restorePraise = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setPraises(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Elogio', id, `Restaurado elogio ${id}`);
  };

  const updateRule = async (code: number, r: Partial<DisciplineRule>) => {
    if (currentUserRole !== 'GESTOR') {
      alert('Acesso Negado: Apenas gestores podem modificar as regras da instituição.');
      return;
    }
    if (supabase && isSupabaseConnected) {
      await supabase!.from('rules').update(r).eq('code', code);
    }
    setRules(prev => prev.map(item => item.code === code ? { ...item, ...r } : item));
    logAction('UPDATE', 'Regra', String(code), `Atualizada regra disciplinar Art. ${code}`);
  };

  const addSummons = async (s: Omit<Summons, 'id'>) => {
    checkWriteAccess();
    let newId = `SUMM${summons.length + 1}`;
    if (supabase && isSupabaseConnected) {
      const dbPayload = {
        student_id: s.studentId,
        date: s.date,
        time: s.time,
        reason: s.reason,
        department: s.department,
        registered_by: s.registeredBy
      };
      try {
        const { data, error } = await supabase!.from('summons').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) {
           setSummons(prev => [{...data, studentId: data.student_id, registeredBy: data.registered_by}, ...prev]);
           newId = data.id;
           logAction('CREATE', 'Convocação', newId, `Adicionada convocação para o aluno ID: ${s.studentId}`);
           return;
        }
      } catch (err: any) {
        console.error("Summons insert error:", err);
        alert(`Erro ao salvar convocação no servidor: ${err.message}`);
        return;
      }
    }
    setSummons(prev => [{ ...s, id: newId }, ...prev]);
    logAction('CREATE', 'Convocação', newId, `Adicionada convocação (LOCAL) para o aluno ID: ${s.studentId}`);
  };

  const updateSummons = async (id: string, s: Partial<Summons>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {};
      if (s.studentId) dbPayload.student_id = s.studentId;
      if (s.date) dbPayload.date = s.date;
      if (s.time) dbPayload.time = s.time;
      if (s.reason) dbPayload.reason = s.reason;
      if (s.department) dbPayload.department = s.department;
      if (s.registeredBy) dbPayload.registered_by = s.registeredBy;
      
      await supabase!.from('summons').update(dbPayload).eq('id', id);
    }
    setSummons(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
    logAction('UPDATE', 'Convocação', id, `Atualizada convocação ${id}`);
  };

  const archiveSummons = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setSummons(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Convocação', id, `Arquivada convocação ${id}`);
  };

  const restoreSummons = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setSummons(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Convocação', id, `Restaurada convocação ${id}`);
  };

  const addConductTerm = async (t: Omit<ConductTerm, 'id'>) => {
    checkWriteAccess();
    let newId = `TAC${conductTerms.length + 1}`;
    if (supabase && isSupabaseConnected) {
      const dbPayload = {
        student_id: t.studentId,
        date: t.date,
        guardian_name: t.guardianName,
        commitments: t.commitments,
        registered_by: t.registeredBy
      };
      try {
        const { data, error } = await supabase!.from('conduct_terms').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) {
           setConductTerms(prev => [{...data, studentId: data.student_id, registeredBy: data.registered_by, guardianName: data.guardian_name}, ...prev]);
           newId = data.id;
           logAction('CREATE', 'Termo de Conduta', newId, `Adicionado TAC para o aluno ID: ${t.studentId}`);
           return;
        }
      } catch (err: any) {
        console.error("Conduct term insert error:", err);
        alert(`Erro ao salvar TAC no servidor: ${err.message}`);
        return;
      }
    }
    setConductTerms(prev => [{ ...t, id: newId }, ...prev]);
    logAction('CREATE', 'Termo de Conduta', newId, `Adicionado TAC (LOCAL) para o aluno ID: ${t.studentId}`);
  };

  const updateConductTerm = async (id: string, t: Partial<ConductTerm>) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) {
      const dbPayload: any = {};
      if (t.studentId) dbPayload.student_id = t.studentId;
      if (t.date) dbPayload.date = t.date;
      if (t.guardianName) dbPayload.guardian_name = t.guardianName;
      if (t.commitments) dbPayload.commitments = t.commitments;
      if (t.registeredBy) dbPayload.registered_by = t.registeredBy;

      await supabase!.from('conduct_terms').update(dbPayload).eq('id', id);
    }
    setConductTerms(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
    logAction('UPDATE', 'Termo de Conduta', id, `Atualizado TAC ${id}`);
  };

  const archiveConductTerm = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setConductTerms(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Termo de Conduta', id, `Arquivado TAC ${id}`);
  };

  const restoreConductTerm = async (id: string) => {
    checkWriteAccess();
    // Column 'archived' does not exist in Supabase yet
    setConductTerms(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Termo de Conduta', id, `Restaurado TAC ${id}`);
  };

  const getStudentOccurrences = (studentId: string) => occurrences.filter(o => o.studentId === studentId && !o.archived);

  const checkRecidivism = (studentId: string, ruleCode: number) => {
    const studentOccurrences = getStudentOccurrences(studentId);
    return studentOccurrences.filter(o => o.ruleCode === ruleCode).length > 0;
  };

  const getEscalationStatus = (studentId: string, ruleCode: number) => {
    const studentOccurrences = getStudentOccurrences(studentId);
    const rule = rules.find(r => r.code === ruleCode);
    if (!rule) return { isEscalated: false, reason: '', measure: '', severity: '' };

    const sameRuleCount = studentOccurrences.filter(o => o.ruleCode === ruleCode).length;
    if (sameRuleCount > 0) {
        const measure = rule.severity === 'Leve' ? 'Advertência Escrita (Agravada)' : 'Suspensão (Agravada)';
        const severity = rule.severity === 'Leve' ? 'Media' : 'Grave';
        return { isEscalated: true, reason: 'Reincidência na mesma infração', measure, severity };
    }

    if (rule.severity === 'Leve') {
        const lightOccurrences = studentOccurrences.filter(o => {
            const r = rules.find(ru => ru.code === o.ruleCode);
            return r?.severity === 'Leve';
        });
        if (lightOccurrences.length >= 3) {
             return { isEscalated: true, reason: 'Acúmulo de 3 ou mais infrações leves', measure: 'Advertência Escrita (Agravada por acúmulo)', severity: 'Media' };
        }
    }

    return { isEscalated: false, reason: '', measure: rule.measure, severity: rule.severity };
  };

  const getStudentBehavior = (points: number) => {
    if (points >= 10) return 'Excepcional';
    if (points >= 9.0) return 'Ótimo';
    if (points >= 7.0) return 'Bom';
    if (points >= 5.0) return 'Regular';
    if (points >= 2.0) return 'Insuficiente';
    return 'Incompatível';
  };

  const getStudentPoints = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 10;
    
    // Initial point according to Art. 45 § 2º: 8.0 for new students
    // But we use 10.0 as theoretical max and Art. 51 allows reaching it.
    let base = 8.0; 
    
    const studentOccurrences = occurrences.filter(o => o.studentId === studentId && !o.archived);
    const studentPraises = praises.filter(p => p.studentId === studentId && !p.archived);
    
    // 1. Deductions (Art. 46)
    let deductions = 0;
    studentOccurrences.forEach(o => {
      const rule = rules.find(r => r.code === o.ruleCode);
      if (rule) {
        // Base deduction by severity if not specified otherwise
        // We use the rule.points which we already set to -0.1, -0.3, -0.5 in data.ts
        let pointsToDeduct = Math.abs(rule.points);
        
        // Check for recidivism (Art. 35 III - Aggravating)
        const count = studentOccurrences.filter(prev => prev.ruleCode === o.ruleCode && new Date(prev.date) < new Date(o.date)).length;
        if (count > 0) {
          pointsToDeduct *= 1.5; // Example aggregator: 50% increase for same rule repeat
        }
        
        deductions += pointsToDeduct;
      }
    });

    // 2. Direct Bonuses from Praise (Art. 47)
    let bonuses = 0;
    studentPraises.forEach(p => {
      if (p.type === 'Individual') bonuses += 0.50;
      if (p.type === 'Coletivo') bonuses += 0.30;
      if (p.type === 'Art. 50') bonuses += 0.50; // Bimester bonus
    });

    // 3. Time-based bonus (Art. 51)
    // 2 months clean: +0.20 per day
    if (studentOccurrences.length > 0) {
      const lastOccur = new Date(Math.max(...studentOccurrences.map(o => new Date(o.date).getTime())));
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
      const today = new Date();
      const diff = today.getTime() - lastOccur.getTime();
      
      if (diff > sixtyDaysInMs) {
        const extraDays = Math.floor((diff - sixtyDaysInMs) / (24 * 60 * 60 * 1000));
        bonuses += extraDays * 0.20;
      }
    } else {
      // Allow bonus for no occurrences? Only if enrolled 2 months ago, but we don't have enroll date.
      // We start at 8.0 for everyone anyway based on Art 45 § 2º.
    }

    const currentPoints = base - deductions + bonuses;
    return Math.min(10, Math.max(0, parseFloat(currentPoints.toFixed(2))));
  };

  const setGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('eecm_session', JSON.stringify({
      type: 'guest',
      timestamp: Date.now()
    }));
  };

  const setMockUser = (username: string) => {
    setUser({ email: username, role: 'admin' });
    setIsGuest(false);
    localStorage.setItem('eecm_session', JSON.stringify({
      type: 'mock',
      email: username,
      timestamp: Date.now()
    }));
  };

  const logout = React.useCallback(async () => {
    localStorage.removeItem('eecm_session');
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsGuest(false);
    setUser(null);
  }, []);

  // Monitor session expiration (10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('eecm_session');
      if (stored) {
        try {
          const { timestamp } = JSON.parse(stored);
          const now = Date.now();
          const TEN_MINUTES = 10 * 60 * 1000;
          
          if (now - timestamp >= TEN_MINUTES) {
            logout();
            console.log("Session expired automatically");
          }
        } catch (e) {
          localStorage.removeItem('eecm_session');
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [logout]);

  return (
    <AppContext.Provider value={{
      students, occurrences, accidents, praises, rules, summons, conductTerms, auditLogs, staffMembers, appUsers, isSupabaseConnected, isSyncing,
      user, isGuest, currentUserRole, isAuthRestored, isDebugMode, setIsDebugMode, 
      geminiApiKey, setGeminiApiKey, groqApiKey, setGroqApiKey,
      setGuestMode, setMockUser, logout,
      logAction, refreshData,
      addAppUser, updateAppUser, deleteAppUser,
      addStudent, importStudents, updateStudent, archiveStudent, restoreStudent, deleteAllStudents,
      addOccurrence, updateOccurrence, archiveOccurrence, restoreOccurrence,
      addAccident, updateAccident, archiveAccident, restoreAccident,
      addPraise, updatePraise, archivePraise, restorePraise,
      addSummons, updateSummons, archiveSummons, restoreSummons,
      addConductTerm, updateConductTerm, archiveConductTerm, restoreConductTerm,
      updateRule, addStaffMember,
      getStudentPoints, getStudentBehavior, getStudentOccurrences, checkRecidivism, getEscalationStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
