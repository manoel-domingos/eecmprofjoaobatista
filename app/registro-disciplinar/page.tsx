'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { useAppContext } from '@/lib/store';
import { Search, Plus, X, Edit2, Archive, Video, FileText, Camera, Clock, MapPin, UserPlus, Trash2, MessageSquare, Phone, Printer } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { Occurrence, StaffMember } from '@/lib/data';
import { getLocalDateString, getLocalTimeString, formatDate, formatPhoneForWhatsApp } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function RegistroDisciplinarContent() {
  const { 
    students, occurrences, rules, staffMembers, user, isGuest, currentUserRole,
    addOccurrence, updateOccurrence, archiveOccurrence, checkRecidivism, getEscalationStatus,
    addStudent, updateStudent, addStaffMember
  } = useAppContext();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Todos os meses');
  const [selectedClass, setSelectedClass] = useState('Todas as turmas');

  useEffect(() => {
    const paramMonth = searchParams.get('month');
    const paramClass = searchParams.get('class');
    if (paramMonth && paramMonth !== 'Selecionar...') setSelectedMonth(paramMonth);
    if (paramClass && paramClass !== 'Todas') setSelectedClass(paramClass);
  }, [searchParams]);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const classes = Array.from(new Set(students.map(s => s.class))).sort();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isGuardianListOpen, setIsGuardianListOpen] = useState(false);
  const [isAddGuardianModalOpen, setIsAddGuardianModalOpen] = useState(false);
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [guardianIgnoredWarning, setGuardianIgnoredWarning] = useState(false);
  const guardianPhoneRef = useRef<HTMLInputElement>(null);
  const [viewOccurrence, setViewOccurrence] = useState<Occurrence | null>(null);
  const [editingOccurrence, setEditingOccurrence] = useState<string | null>(null);

  // Modal form state
  const [selectedStudent, setSelectedStudent] = useState('');
  
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsGuardianListOpen(false);
  }, [selectedStudent]);

  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [location, setLocation] = useState('Pátio');
  const [locatedBy, setLocatedBy] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [ruleSearch, setRuleSearch] = useState('');
  const [registeredBy, setRegisteredBy] = useState('');
  const [observations, setObservations] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [signedDocUrls, setSignedDocUrls] = useState<string[]>([]);

  // Student Form State
  const [newName, setNewName] = useState('');
  const [newClassName, setNewClassName] = useState('6º Ano A');
  const [newShift, setNewShift] = useState<'Matutino' | 'Vespertino' | 'Noturno'>('Matutino');
  const [newContacts, setNewContacts] = useState<{name: string, phone: string}[]>([{ name: '', phone: '' }]);
  const [ignoredWarning, setIgnoredWarning] = useState(false);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Monitor' | 'Professor' | 'Coord.' | 'Diretora' | 'G1' | 'G2'>('Monitor');

  const locations = ['Pátio', 'Quadra', 'Refeitório', 'Sala'].sort();

  const getLoggedUserName = () => {
    if (user?.email) {
      // Try to find in staff members first
      const staff = staffMembers.find(s => s.name.toLowerCase() === user.email.split('@')[0].toLowerCase());
      if (staff) return `${staff.role} ${staff.name}`;
      return user.email.split('@')[0];
    }
    return isGuest ? 'Somente Leitura' : 'Gestor Escolar';
  };

  const filteredOccurrences = occurrences.filter(o => {
    if (o.archived) return false;
    const student = students.find(s => s.id === o.studentId);
    
    // Month filter
    const defaultDate = new Date(o.date);
    const monthIndex = parseInt(o.date.split('-')[1]) - 1; 
    const month = months[monthIndex] || months[defaultDate.getMonth()];
    if (selectedMonth !== 'Todos os meses' && selectedMonth !== '' && month.toLowerCase() !== selectedMonth.toLowerCase()) {
      return false;
    }

    // Class filter
    if (selectedClass !== 'Todas as turmas' && selectedClass !== '') {
      if (!student || student.class.toLowerCase() !== selectedClass.toLowerCase()) {
        return false;
      }
    }

    if (!searchTerm) return true; // Show all non-archived by default
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const matchedRules = rules.filter(r => 
    r.description.toLowerCase().includes(ruleSearch.toLowerCase()) ||
    r.code.toString().includes(ruleSearch)
  ).slice(0, 5); // show top 5

  const activeRule = rules.find(r => r.code.toString() === selectedRule);

  const openAddModal = () => {
    const now = new Date();
    
    // Get date in YYYY-MM-DD format based on local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    
    const localHour = now.toTimeString().split(' ')[0].substring(0, 5);

    setEditingOccurrence(null);
    setSelectedStudent('');
    setDate(localDate);
    setHour(localHour);
    setLocation('Pátio');
    setLocatedBy('');
    setSelectedRule('');
    setRuleSearch('');
    setRegisteredBy(getLoggedUserName());
    setObservations('');
    setVideoUrls([]);
    setSignedDocUrls([]);
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, o: Occurrence) => {
    e.stopPropagation();
    setEditingOccurrence(o.id);
    setSelectedStudent(o.studentId);
    setDate(o.date);
    setHour(o.hour || '');
    setLocation(o.location || 'Pátio');
    setLocatedBy(o.locatedBy || '');
    setSelectedRule(o.ruleCode.toString());
    const rule = rules.find(r => r.code === o.ruleCode);
    setRuleSearch(rule ? rule.description : '');
    setRegisteredBy(o.registeredBy || getLoggedUserName());
    setObservations(o.observations || '');
    setVideoUrls(o.videoUrls || []);
    setSignedDocUrls(o.signedDocUrls || []);
    setIsModalOpen(true);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente arquivar este registro disciplinar?')) {
      archiveOccurrence(id);
    }
  };

  const handlePrint = (o: any) => {
    const student = students.find(s => s.id === o.studentId);
    const rule = rules.find(r => r.code === o.ruleCode);
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <h${""}tml lang="pt-BR">
        <head>
          <title>Registro Disciplinar - ${student?.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.5; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-bold: true; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; color: #555; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 14px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
            .signature-line { border-top: 1px solid #000; padding-top: 8px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">REGISTRO DE OCORRÊNCIA DISCIPLINAR</div>
            <div class="subtitle">Escola Estadual Cívico-Militar</div>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="label">Aluno</div>
              <div class="value">${student?.name || '---'}</div>
            </div>
            <div class="section">
              <div class="label">Turma</div>
              <div class="value">${student?.class || '---'} - ${student?.shift || '---'}</div>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="label">Data / Hora</div>
              <div class="value">${formatDate(o.date)} - ${o.hour || '---'}</div>
            </div>
            <div class="section">
              <div class="label">Local</div>
              <div class="value">${o.location}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">Falta Disciplinar (Artigo)</div>
            <div class="value">Art. ${o.ruleCode}: ${rule?.description || 'Ocorrência personalizada'}</div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="label">Gravidade</div>
              <div class="value">${o.severity}</div>
            </div>
            <div class="section">
              <div class="label">Medida Administrativa</div>
              <div class="value">${o.measure || 'A definir'}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">Observações Complementares</div>
            <div class="value" style="min-height: 80px; border: 1px solid #eee; padding: 10px; border-radius: 4px; font-size: 13px;">
              ${o.observations || 'Nenhuma observação adicional.'}
            </div>
          </div>

          <div class="signature-grid">
            <div class="signature-line">Assinatura do Aluno</div>
            <div class="signature-line">Assinatura do Responsável</div>
          </div>
          
          <div class="signature-grid" style="grid-template-columns: 1fr; width: 300px; margin: 40px auto 0;">
            <div class="signature-line">Gestão Escolar/Militar</div>
          </div>

          <div class="footer">
            Documento gerado em ${new Date().toLocaleString('pt-BR')} via Sistema de Gestão Disciplinar
          </div>
        </body>
      </h${""}tml>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRule) return;

    if (!editingOccurrence) {
       const escalation = getEscalationStatus(selectedStudent, parseInt(selectedRule, 10));
       if (escalation.isEscalated) {
          const confirmed = window.confirm(`⚠️ ATENÇÃO: ${escalation.reason}!\n\nA medida sugerida subiu para: ${escalation.measure}.\n\nDeseja confirmar este registro com a medida agravada?`);
          if (!confirmed) return; // Cancela se o usuário não confirmar
       }
    }

    if (editingOccurrence) {
      updateOccurrence(editingOccurrence, {
        studentId: selectedStudent,
        date,
        hour,
        location,
        locatedBy,
        ruleCode: parseInt(selectedRule, 10),
        registeredBy,
        observations,
        videoUrls,
        signedDocUrls
      });
    } else {
      addOccurrence({
        studentId: selectedStudent,
        date,
        hour,
        location,
        locatedBy,
        ruleCode: parseInt(selectedRule, 10),
        registeredBy,
        observations,
        videoUrls,
        signedDocUrls
      });
    }

    setIsModalOpen(false);
    setEditingOccurrence(null);
    // Reset form
    setSelectedStudent('');
    setSelectedRule('');
    setRuleSearch('');
    setObservations('');
    setVideoUrls([]);
    setSignedDocUrls([]);
  };

  const handleAddContact = () => {
    setNewContacts([...newContacts, { name: '', phone: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    const contacts = [...newContacts];
    contacts.splice(index, 1);
    setNewContacts(contacts.length > 0 ? contacts : [{ name: '', phone: '' }]);
  };

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    const contacts = [...newContacts];
    if (field === 'phone') {
        let v = value.replace(/\D/g, '');
        if (v.length > 0 && (v === '9' || v === '8')) v = '65' + v;
        if (v.length > 11) v = v.slice(0, 11);

        let formatted = v;
        if (v.length > 0) {
            if (v.length <= 2) formatted = `(${v}`;
            else if (v.length <= 6) formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            else if (v.length <= 10) formatted = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
            else formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        }
        contacts[index][field] = formatted;
        setIgnoredWarning(false);
        const inputRef = phoneRefs.current[index];
        if (inputRef) inputRef.setCustomValidity('');
    } else {
        contacts[index][field] = value;
    }
    setNewContacts(contacts);
  };

  const handleAddQuickGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newGuardianName || !newGuardianPhone) return;

    const currentStudent = students.find(s => s.id === selectedStudent);
    if (!currentStudent) return;

    if (!guardianIgnoredWarning) {
      const nums = newGuardianPhone.replace(/\D/g, '');
      if (nums.length === 10) {
        if (guardianPhoneRef.current) {
          guardianPhoneRef.current.setCustomValidity('Falta um "9" na frente deste número. Clique em Confirmar novamente se quiser salvar assim mesmo.');
          guardianPhoneRef.current.reportValidity();
          setGuardianIgnoredWarning(true);
          return;
        }
      }
    }

    setGuardianIgnoredWarning(false);

    const updatedContacts = [
      ...(currentStudent.contacts || []),
      { name: newGuardianName, phone: newGuardianPhone }
    ];

    updateStudent(selectedStudent, { contacts: updatedContacts });
    setNewGuardianName('');
    setNewGuardianPhone('');
    setIsAddGuardianModalOpen(false);
    setIsGuardianListOpen(true);
  };

  const handleQuickGuardianPhoneChange = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 0 && (v === '9' || v === '8')) v = '65' + v;
    if (v.length > 11) v = v.slice(0, 11);

    let formatted = v;
    if (v.length > 0) {
        if (v.length <= 2) formatted = `(${v}`;
        else if (v.length <= 6) formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        else if (v.length <= 10) formatted = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
        else formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    }
    setNewGuardianPhone(formatted);
    setGuardianIgnoredWarning(false);
    if (guardianPhoneRef.current) guardianPhoneRef.current.setCustomValidity('');
  };

  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newClassName) return;

    // Filter valid contacts
    const validContacts = newContacts.filter(c => c.name.trim() !== '' || c.phone.trim() !== '');

    if (!ignoredWarning) {
      let firstInvalidIndex = -1;
      const hasMissingNine = validContacts.some((c, idx) => {
         const nums = c.phone.replace(/\D/g, '');
         if (nums.length === 10) {
            firstInvalidIndex = idx;
            return true;
         }
         return false;
      });

      if (hasMissingNine && firstInvalidIndex !== -1 && phoneRefs.current[firstInvalidIndex]) {
         const input = phoneRefs.current[firstInvalidIndex];
         if (input) {
           input.setCustomValidity('Falta um "9" na frente deste número. Clique em Confirmar novamente se quiser salvar assim mesmo.');
           input.reportValidity();
           setIgnoredWarning(true);
           return;
         }
      }
    }

    setIgnoredWarning(false);

    addStudent({
      name: newName,
      class: newClassName,
      shift: newShift,
      points: 10.0,
      contacts: validContacts.length > 0 ? validContacts : undefined
    });
    setNewName('');
    setNewContacts([{ name: '', phone: '' }]);
    setIsStudentModalOpen(false);
  };

  const handleWhatsAppRedirect = (phone: string, studentName: string) => {
    const url = formatPhoneForWhatsApp(phone, studentName);
    if (!url) return;

    // If we are in the main modal (new/edit), auto-save before redirecting
    if (isModalOpen && selectedStudent && selectedRule) {
      if (editingOccurrence) {
        updateOccurrence(editingOccurrence, {
          studentId: selectedStudent,
          date,
          hour,
          location,
          locatedBy,
          ruleCode: parseInt(selectedRule, 10),
          registeredBy,
          observations,
          videoUrls,
          signedDocUrls
        });
      } else {
        addOccurrence({
          studentId: selectedStudent,
          date,
          hour,
          location,
          locatedBy,
          ruleCode: parseInt(selectedRule, 10),
          registeredBy,
          observations,
          videoUrls,
          signedDocUrls
        });
      }
      setIsModalOpen(false);
      setEditingOccurrence(null);
      setSelectedStudent('');
      setSelectedRule('');
      setRuleSearch('');
      setObservations('');
      setVideoUrls([]);
      setSignedDocUrls([]);
      setIsGuardianListOpen(false);
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuickAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    addStaffMember({
      name: newStaffName,
      role: newStaffRole
    });
    setLocatedBy(`${newStaffRole} ${newStaffName}`);
    setNewStaffName('');
    setIsStaffModalOpen(false);
  };

  const handleExport = (o: Occurrence) => {
    const student = students.find(s => s.id === o.studentId);
    const rule = rules.find(r => r.code === o.ruleCode);
    
    // Calculate if it was escalated at the time
    const studentOccurrences = occurrences.filter(oc => oc.studentId === o.studentId && new Date(oc.date) <= new Date(o.date));
    const sameRuleCount = studentOccurrences.filter(oc => oc.ruleCode === o.ruleCode).length;
    let isEscalated = sameRuleCount > 1;
    let measure = rule?.measure || '';
    if (isEscalated) {
         measure = rule?.severity === 'Leve' ? 'Advertência Escrita (Agravada)' : 'Suspensão (Agravada)';
    } else if (rule?.severity === 'Leve' && studentOccurrences.filter(oc => rules.find(r => r.code === oc.ruleCode)?.severity === 'Leve').length >= 3) {
         isEscalated = true;
         measure = 'Advertência Escrita (Agravada por acúmulo)';
    }

    const docTitle = measure.includes('Escrita') ? 'TERMO DE ADVERTÊNCIA ESCRITA' : 
                     measure.includes('Suspensão') ? 'TERMO DE SUSPENSÃO' : 
                     'REGISTRO DISCIPLINAR';

    // We shouldn't use window.open strictly inside an iframe cleanly in all cases, 
    // but a popup for printing usually works. Let's use a nice hidden iframe print or just window popup.
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <h${""}tml lang="pt-BR">
        <head>
          <title>${docTitle} - ${student?.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .row { margin-bottom: 12px; font-size: 14px; }
            .label { font-weight: 600; color: #475569; display: inline-block; width: 150px; }
            .value { color: #0f172a; font-weight: 500; }
            .box { border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin-top: 30px; background: #f8fafc; }
            .box .label { width: 180px; }
            .signature { margin-top: 80px; display: flex; justify-content: space-between; gap: 40px; }
            .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; flex: 1; text-align: center; font-size: 12px; color: #475569; }
            .obs-box { margin-top: 10px; padding: 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; min-height: 80px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${docTitle}</h1>
            <p class="subtitle">Escola Estadual Cívico-Militar</p>
          </div>
          
          <div class="row"><span class="label">Data do Registro:</span><span class="value">${formatDate(o.date)} ${o.hour || ''}</span></div>
          <div class="row"><span class="label">Local:</span><span class="value">${o.location || 'Não informado'}</span></div>
          <div class="row"><span class="label">Aluno:</span><span class="value">${student?.name}</span></div>
          <div class="row"><span class="label">Turma:</span><span class="value">${student?.class}</span></div>
          <div class="row"><span class="label">Localizado por:</span><span class="value">${o.locatedBy || 'Não informado'}</span></div>
          <div class="row"><span class="label">Registrado por:</span><span class="value">${o.registeredBy || 'Sistema'}</span></div>
          
          <div class="box">
            <div class="row"><span class="label">Infração (Art. ${rule?.code}):</span><span class="value">${rule?.description}</span></div>
            <div class="row"><span class="label">Gravidade:</span><span class="value">${rule?.severity}</span></div>
            <div class="row"><span class="label">Medida Administrativa:</span><span class="value">${measure}</span></div>
            <div class="row"><span class="label">Impacto na Pontuação:</span><span class="value" style="color: #ef4444;">-${rule?.points} pontos</span></div>
          </div>
          
          <div class="row" style="margin-top: 24px;">
            <span class="label" style="width: auto;">Observações Adicionais:</span>
            <div class="obs-box">${o.observations || 'Nenhuma observação detalhada foi fornecida no momento do registro.'}</div>
          </div>

          <div class="signature">
            <div class="sig-line">Gestão Escolar/Militar<br>(Assinatura e Carimbo)</div>
            <div class="sig-line">Aluno(a)<br>(Assinatura)</div>
            <div class="sig-line">Responsável Legal<br>(Assinatura)</div>
          </div>
        </body>
      </h${""}tml>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Registro Disciplinar</h1>
            <p className="text-slate-500 text-sm">Gerenciamento de ocorrências dos alunos.</p>
          </div>
          {currentUserRole !== 'GUEST' && (
            <button 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" /> Nova Ocorrência
            </button>
          )}
        </div>

        {/* List Card */}
        <div className="glass-card overflow-hidden mt-6">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar por aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2 text-sm text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                <SearchableSelect
                  options={[
                    { value: 'Todas as turmas', label: 'Todas as turmas' },
                    ...classes.map(c => ({ value: c, label: c }))
                  ]}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  placeholder="Pesquisar Turma..."
                  heightClass="py-2 text-sm"
                />
              </div>
              <div className="relative w-full md:w-48">
                <SearchableSelect
                  options={[
                    { value: 'Todos os meses', label: 'Todos os meses' },
                    ...months.map(m => ({ value: m, label: m }))
                  ]}
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  placeholder="Pesquisar Mês..."
                  heightClass="py-2 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Aluno</th>
                  <th className="px-6 py-3 font-medium">Turma</th>
                  <th className="px-6 py-3 font-medium">Infração</th>
                  <th className="px-6 py-3 font-medium">Gravidade</th>
                  <th className="px-6 py-3 font-medium">Medida</th>
                  <th className="px-6 py-3 font-medium w-24 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredOccurrences.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma ocorrência encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredOccurrences.map((o) => {
                    const student = students.find(s => s.id === o.studentId);
                    const rule = rules.find(r => r.code === o.ruleCode);
                    
                    return (
                      <tr 
                        key={o.id} 
                        onClick={() => setViewOccurrence(o)}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        title="Clique para ver os detalhes ou exportar"
                      >
                        <td className="px-6 py-4">{formatDate(o.date)}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{student?.name || 'Aluno não encontrado'}</td>
                        <td className="px-6 py-4">{student?.class || '-'}</td>
                        <td className="px-6 py-4 truncate max-w-[200px]">{rule?.code} - {rule?.description}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            rule?.severity === 'Leve' ? 'bg-blue-500/10 text-blue-400' :
                            rule?.severity === 'Media' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {rule?.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">{rule?.measure}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-2">
                             {currentUserRole !== 'GUEST' && (
                               <button 
                                 onClick={(e) => openEditModal(e, o)}
                                 className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                                 title="Editar"
                               >
                                  <Edit2 className="w-4 h-4" />
                               </button>
                             )}
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleExport(o); }}
                               className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                               title="Imprimir / Exportar PDF"
                             >
                                <Printer className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col !bg-white/90 dark:!bg-slate-900/90 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingOccurrence ? 'Editar Ocorrência' : 'Nova Ocorrência'}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); setIsGuardianListOpen(false); }}
                className="text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="max-w-md mx-auto space-y-5">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Aluno *</label>
                    <SearchableSelect
                      options={students.map(s => ({ value: s.id, label: `${s.name} - ${s.class} (${s.shift})` }))}
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                      placeholder="Selecione o aluno"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsStudentModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition shrink-0"
                    title="Cadastrar novo aluno"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">
                      <Edit2 className="w-4 h-4" /> DATA
                    </label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> HORA
                    </label>
                    <input 
                      type="time" 
                      required
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> LOCAL
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Ocorrência (Artigo) *</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Busque por 'boné', 'celular', etc..."
                      value={ruleSearch}
                      onChange={(e) => setRuleSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                  </div>
                  
                  {ruleSearch && !selectedRule && (
                    <div className="bg-white border border-slate-200 rounded-lg max-h-40 overflow-y-auto mt-1 mb-3">
                      {matchedRules.map(r => (
                        <div 
                          key={r.code}
                          onClick={() => { setSelectedRule(r.code.toString()); setRuleSearch(''); }}
                          className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-200/50 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-800 text-sm font-medium">Cód. {r.code}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              r.severity === 'Leve' ? 'bg-blue-500/20 text-blue-400' :
                              r.severity === 'Media' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>{r.severity}</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">{r.description}</p>
                        </div>
                      ))}
                      {matchedRules.length === 0 && (
                        <div className="p-3 text-sm text-slate-500">Nenhuma infração encontrada.</div>
                      )}
                    </div>
                  )}
                  
                  {selectedRule && activeRule && (() => {
                    const escalation = selectedStudent ? getEscalationStatus(selectedStudent, activeRule.code) : { isEscalated: false, reason: '', measure: activeRule.measure, severity: activeRule.severity };
                    return (
                    <div className="bg-white border border-slate-200 rounded-lg p-4 mt-2 flex justify-between items-center relative">
                      <button 
                        type="button"
                        onClick={() => setSelectedRule('')}
                        className="absolute top-2 right-2 text-slate-500 hover:text-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="pr-6 w-full">
                        <p className="text-slate-800 text-sm font-medium mb-1">Cód. {activeRule.code} - {activeRule.description}</p>
                        
                        {escalation.isEscalated && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-[11px] text-orange-700 font-bold flex flex-col gap-1">
                             <div className="flex items-center gap-2">⚠️ ATENÇÃO: {escalation.reason}!</div>
                             <div className="font-normal">A infração será agravada automaticamente.</div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              escalation.severity === 'Leve' ? 'bg-blue-500/10 text-blue-500' :
                              escalation.severity === 'Media' ? 'bg-yellow-500/10 text-yellow-600' :
                              'bg-red-500/10 text-red-600'
                            }`}>
                              Gravidade: {escalation.severity}
                          </span>
                          <span className="text-[11px] text-slate-500">Impacto Base: <strong className="text-red-500">{activeRule.points} pts</strong></span>
                          <span className="text-[11px] text-slate-500">Medida Recomendada: <strong className="text-slate-800">
                            {escalation.measure}
                          </strong></span>
                        </div>
                      </div>
                    </div>
                  )})()}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Localizado por</label>
                    <SearchableSelect
                      options={staffMembers.map(s => ({ value: `${s.role} ${s.name}`, label: `${s.role} ${s.name}` }))}
                      value={locatedBy}
                      onChange={setLocatedBy}
                      placeholder="Quem localizou a infração?"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsStaffModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition shrink-0"
                    title="Cadastrar novo membro da equipe"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Registrado por</label>
                  <input 
                    type="text" 
                    value={registeredBy}
                    onChange={(e) => setRegisteredBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center justify-between">
                    Observações adicionais
                    <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Ajuste o tamanho se necessário</span>
                  </label>
                  <textarea 
                    rows={2}
                    value={observations}
                    onChange={(e) => {
                      setObservations(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px] text-sm overflow-hidden"
                    placeholder="Descreva o que ocorreu..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">FOTOS/VÍDEOS (PROVAS)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {videoUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          {url.startsWith('blob:') || url.includes('video') || url.endsWith('.mp4') ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Video className="w-8 h-8 text-white/50" />
                            </div>
                          ) : (
                            <img src={url} className="w-full h-full object-cover" alt="Anexo" />
                          )}
                          <button 
                            type="button"
                            onClick={() => setVideoUrls(videoUrls.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'video/*,image/*';
                          input.capture = 'environment';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                               const url = URL.createObjectURL(file);
                               setVideoUrls([...videoUrls, url]);
                            }
                          };
                          input.click();
                        }}
                        className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-100 hover:border-blue-300 transition-all text-slate-400 hover:text-blue-500"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-center px-1">Adicionar Foto/Vídeo</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">DOCUMENTOS ASSINADOS</label>
                    <div className="grid grid-cols-2 gap-2">
                      {signedDocUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} className="w-full h-full object-cover" alt="Documento" />
                          <button 
                            type="button"
                            onClick={() => setSignedDocUrls(signedDocUrls.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 setSignedDocUrls([...signedDocUrls, reader.result as string]);
                               };
                               reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-100 hover:border-blue-300 transition-all text-slate-400 hover:text-blue-500"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-center px-1">Anexar documento assinado</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between sticky bottom-0 border-t border-slate-200 p-5 -mx-5 -mb-5 mt-4 bg-white">
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedStudent}
                    onClick={() => setIsGuardianListOpen(!isGuardianListOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition font-medium disabled:opacity-50"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-4 h-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Falar com responsável
                  </button>

                  {isGuardianListOpen && selectedStudent && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-[60]">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                        <h4 className="text-sm font-bold text-slate-800">Responsáveis</h4>
                        <button 
                          type="button"
                          onClick={() => { setIsGuardianListOpen(false); setIsAddGuardianModalOpen(true); }}
                          className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Cadastrar responsável"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {students.find(s => s.id === selectedStudent)?.contacts?.length ? (
                          students.find(s => s.id === selectedStudent)?.contacts?.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleWhatsAppRedirect(c.phone, students.find(s => s.id === selectedStudent)?.name || '')}
                              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg group transition border border-transparent hover:border-emerald-200 text-left"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">{c.name || 'Responsável'}</p>
                                <p className="text-xs text-slate-500">{c.phone}</p>
                              </div>
                              <Phone className="w-4 h-4 text-emerald-500" />
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 text-center py-4 italic">
                            Aluno não tem responsáveis cadastrados.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {editingOccurrence && (
                    <button 
                      type="button" 
                      onClick={(e) => { setIsModalOpen(false); handleArchive(e, editingOccurrence); }}
                      className="px-4 py-2 rounded-lg text-orange-600 hover:bg-orange-50 transition font-medium flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" /> Arquivar
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => { setIsModalOpen(false); setIsGuardianListOpen(false); }}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!selectedStudent || !selectedRule}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingOccurrence ? 'Salvar Alterações' : 'Confirmar Registro'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Cadastrar Aluno Manualmente
              </h2>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickAddStudent} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João da Silva..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Turma *</label>
                  <div className="flex gap-2">
                    <select 
                      required
                      value={newClassName.replace(/ [A-Z]$/i, '') || '6º Ano'}
                      onChange={(e) => {
                        const letter = newClassName.match(/ ([A-Z])$/i)?.[1] || 'A';
                        setNewClassName(`${e.target.value} ${letter}`);
                      }}
                      className="w-2/3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="6º Ano">6º Ano</option>
                      <option value="7º Ano">7º Ano</option>
                      <option value="8º Ano">8º Ano</option>
                      <option value="9º Ano">9º Ano</option>
                      <option value="1º Ano">1º Ano</option>
                      <option value="2º Ano">2º Ano</option>
                      <option value="3º Ano">3º Ano</option>
                    </select>
                    <select 
                      required
                      value={newClassName.match(/ ([A-Z])$/i)?.[1] || 'A'}
                      onChange={(e) => {
                        const prefix = newClassName.replace(/ [A-Z]$/i, '') || '6º Ano';
                        setNewClassName(`${prefix} ${e.target.value}`);
                      }}
                      className="w-1/3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Turno *</label>
                  <select 
                    required
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Noturno">Noturno</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600">Contatos dos Responsáveis</label>
                {newContacts.map((contact, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Responsável"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      ref={(el) => { phoneRefs.current[index] = el; }}
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Telefone"
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={handleAddContact}
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition shrink-0 flex items-center justify-center"
                        title="Adicionar mais um contato"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition shrink-0 flex items-center justify-center"
                        title="Remover contato"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-5 pt-5">
                <button 
                  type="button" 
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-white transition font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!newName || !newClassName}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Add Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Cadastrar Membro da Equipe</h3>
                <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleQuickAddStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
                      <select 
                        value={newStaffRole} 
                        onChange={e => setNewStaffRole(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                         <option value="Monitor">Monitor</option>
                         <option value="Professor">Professor</option>
                         <option value="Coord.">Coord.</option>
                         <option value="Diretora">Diretora</option>
                         <option value="G1">G1</option>
                         <option value="G2">G2</option>
                      </select>
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                      <input 
                         type="text" 
                         required 
                         autoFocus
                         value={newStaffName} 
                         onChange={e => setNewStaffName(e.target.value)}
                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm mt-2">
                   Confirmar Cadastro
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Modal Visualização de Ocorrência */}
      {viewOccurrence && (() => {
        const o = viewOccurrence;
        const student = students.find(s => s.id === o.studentId);
        const rule = rules.find(r => r.code === o.ruleCode);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Detalhes da Ocorrência</h2>
                <button 
                  onClick={() => { setViewOccurrence(null); setIsGuardianListOpen(false); }}
                  className="text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Aluno</h3>
                  <p className="text-lg font-medium text-slate-800">{student?.name || 'Aluno não encontrado'}</p>
                  <p className="text-sm text-slate-500">Turma {student?.class || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Data</h3>
                    <p className="text-slate-800 font-medium">{formatDate(o.date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Registrado Por</h3>
                    <p className="text-slate-800 font-medium">{o.registeredBy || 'Sistema'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-800">Art. {rule?.code}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      rule?.severity === 'Leve' ? 'bg-blue-500/10 text-blue-600' :
                      rule?.severity === 'Media' ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {rule?.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{rule?.description}</p>
                  
                  <div className="text-xs space-y-1">
                    <div className="flex text-slate-500">
                      <span className="w-20 font-medium">Medida:</span>
                      <span className="text-slate-800">{rule?.measure}</span>
                    </div>
                    <div className="flex text-slate-500">
                      <span className="w-20 font-medium">Impacto:</span>
                      <span className="text-red-500 font-medium">-{rule?.points} pontos</span>
                    </div>
                  </div>
                </div>

                {o.observations && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Observações</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {o.observations}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {((o.videoUrls && o.videoUrls.length > 0) || (o.videoUrls === undefined && (o as any).videoUrl)) && (
                    <div className="space-y-2">
                       <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Vídeos/Provas</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {(o.videoUrls || [(o as any).videoUrl]).filter(Boolean).map((url: string, index: number) => (
                            <div key={index} className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                               <video src={url} className="w-full h-full object-cover" controls />
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                  {((o.signedDocUrls && o.signedDocUrls.length > 0) || (o.signedDocUrls === undefined && (o as any).signedDocUrl)) && (
                    <div className="space-y-2">
                       <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Documentos Assinados</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {(o.signedDocUrls || [(o as any).signedDocUrl]).filter(Boolean).map((url: string, index: number) => (
                            <div key={index} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                               <img src={url} className="w-full h-full object-cover cursor-zoom-in" onClick={() => window.open(url, '_blank')} alt="Assinada" />
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 p-5 bg-slate-50 flex items-center justify-between mt-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGuardianListOpen(!isGuardianListOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition font-medium"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-4 h-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Falar com responsável
                  </button>

                  {isGuardianListOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-[60]">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Responsáveis</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {student?.contacts?.length ? (
                          student.contacts.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleWhatsAppRedirect(c.phone, student.name)}
                              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg group transition border border-transparent hover:border-emerald-200 text-left"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">{c.name || 'Responsável'}</p>
                                <p className="text-xs text-slate-500">{c.phone}</p>
                              </div>
                              <Phone className="w-4 h-4 text-emerald-500" />
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 text-center py-4 italic">
                            Aluno não tem responsáveis cadastrados.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 flex-wrap">
                  <button 
                    onClick={(e) => { setViewOccurrence(null); handleArchive(e, o.id); }}
                    className="px-4 py-2 rounded-lg text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition font-medium flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" /> Arquivar este registro
                  </button>
                  <button 
                    onClick={() => { setViewOccurrence(null); setIsGuardianListOpen(false); }}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition font-medium"
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={() => handleExport(o)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow-sm flex items-center gap-2"
                  >
                    Exportar PDF (Imprimir)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal Add Quick Guardian */}
      {isAddGuardianModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Adicionar Responsável</h3>
                <button onClick={() => setIsAddGuardianModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleAddQuickGuardian} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Responsável</label>
                   <input 
                      type="text" 
                      required 
                      autoFocus
                      value={newGuardianName} 
                      onChange={e => setNewGuardianName(e.target.value)}
                      placeholder="Ex: Maria Souza"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone/WhatsApp</label>
                  <input 
                    ref={guardianPhoneRef}
                    type="tel" 
                    required 
                    value={newGuardianPhone} 
                    onChange={e => handleQuickGuardianPhoneChange(e.target.value)}
                    placeholder="(65) 9..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm mt-2">
                   Confirmar Cadastro
                </button>
             </form>
          </div>
        </div>
      )}
    </AppShell>

  );
}

export default function RegistroDisciplinar() {
  return (
    <Suspense fallback={<AppShell><div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div></AppShell>}>
      <RegistroDisciplinarContent />
    </Suspense>
  );
}
