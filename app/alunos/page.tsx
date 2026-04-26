'use client';

import React, { useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useAppContext } from '@/lib/store';
import { Users, Plus, Upload, Download, Search, X, Edit2, Archive, Trash2, ChevronDown } from 'lucide-react';
import ImportWizard from '@/components/ImportWizard';
import * as XLSX from 'xlsx';

export default function Alunos() {
  const { 
    students, 
    addStudent, 
    importStudents, 
    updateStudent, 
    archiveStudent, 
    getStudentPoints, 
    getStudentBehavior, 
    deleteAllStudents, 
    currentUserRole 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [shift, setShift] = useState<'Matutino' | 'Vespertino' | 'Noturno'>('Matutino');
  const [contacts, setContacts] = useState<{name: string, phone: string}[]>([{ name: '', phone: '' }]);
  const [observation, setObservation] = useState('');
  const [address, setAddress] = useState('');
  const [cpf, setCpf] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ignoredWarning, setIgnoredWarning] = useState(false);

  // Exclusão state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  const uniqueClasses = Array.from(new Set(students.filter(s => !s.archived).map(s => s.class))).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
       if (aNum === bNum) return a.localeCompare(b);
       return aNum - bNum;
    }
    return a.localeCompare(b);
  });

  const filteredStudents = students.filter(s => {
    if (s.archived) return false;
    if (classFilter && s.class !== classFilter) return false;
    
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    
    if (s.name.toLowerCase().includes(term) || s.class.toLowerCase().includes(term)) return true;
    if (s.contacts && s.contacts.some(c => c.name.toLowerCase().includes(term))) return true;
    return false;
  });

  const openAddModal = () => {
    setEditingStudentId(null);
    setName('');
    setClassName('');
    setShift('Matutino');
    setContacts([{ name: '', phone: '' }]);
    setObservation('');
    setAddress('');
    setCpf('');
    setRegistrationNumber('');
    setBirthDate('');
    setIgnoredWarning(false);
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStudentId(s.id);
    setName(s.name);
    setClassName(s.class);
    setShift(s.shift);
    setContacts(s.contacts && s.contacts.length > 0 ? s.contacts.map((c: any) => ({...c})) : [{ name: '', phone: '' }]);
    setObservation(s.observation || '');
    setAddress(s.address || '');
    setCpf(s.cpf || '');
    setRegistrationNumber(s.registrationNumber || '');
    setBirthDate(s.birthDate || '');
    setIgnoredWarning(false);
    setIsModalOpen(true);
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts.length > 0 ? newContacts : [{ name: '', phone: '' }]);
  };

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index] };
    if (field === 'phone') {
        const oldPhone = newContacts[index].phone;
        let v = value.replace(/\D/g, '');
        const oldV = oldPhone.replace(/\D/g, '');

        if (v.length > oldV.length && oldV.length === 0 && (v === '9' || v === '8')) {
           v = '65' + v;
        }

        if (v.length > 11) v = v.slice(0, 11);

        let formatted = v;
        if (v.length > 0) {
            if (v.length <= 2) formatted = `(${v}`;
            else if (v.length <= 6) formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            else if (v.length <= 10) formatted = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
            else formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        }

        newContacts[index][field] = formatted;
        setIgnoredWarning(false);
        const inputRef = phoneRefs.current[index];
        if (inputRef) inputRef.setCustomValidity('');
    } else {
        newContacts[index][field] = value;
    }
    setContacts(newContacts);
  };

  const handleArchive = () => {
    if (editingStudentId && deleteConfirmText.toLowerCase() === 'arquivar') {
      archiveStudent(editingStudentId);
      setIsDeleteConfirmOpen(false);
      setIsModalOpen(false);
      setEditingStudentId(null);
      setDeleteConfirmText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !className) return;

    const validContacts = contacts.filter(c => c.name.trim() !== '' || c.phone.trim() !== '');

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

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        name,
        class: className,
        shift,
        observation: observation || undefined,
        address: address || undefined,
        cpf: cpf || undefined,
        registrationNumber: registrationNumber || undefined,
        birthDate: birthDate || undefined,
        contacts: validContacts.length > 0 ? validContacts : undefined
      });
    } else {
      addStudent({
        name,
        class: className,
        shift,
        points: 10.0,
        observation: observation || undefined,
        address: address || undefined,
        cpf: cpf || undefined,
        registrationNumber: registrationNumber || undefined,
        birthDate: birthDate || undefined,
        contacts: validContacts.length > 0 ? validContacts : undefined
      });
    }

    setIsModalOpen(false);
    setEditingStudentId(null);
  };

  const handleImport = () => {
    setIsWizardOpen(true);
  };

  const handleExport = () => {
    const headers = ['ID,Nome,Turma,Turno,Nota Disciplinar'];
    const rows = students.map(s => `${s.id},${s.name},${s.class},${s.shift},${getStudentPoints(s.id)}`);
    const csvContent = headers.concat(rows).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'lista_alunos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = async () => {
    setIsDeleteAllConfirmOpen(true);
    setDeleteAllConfirmText('');
  };

  const confirmDeleteAll = async () => {
    if (deleteAllConfirmText.toLowerCase() === 'apagar todos') {
       await deleteAllStudents();
       setIsDeleteAllConfirmOpen(false);
    }
  };

  const formatPhoneForWhatsApp = (phone: string, studentName: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length < 10) return '';
    const hasCountryCode = numbers.startsWith('55') && numbers.length >= 12;
    const baseUrl = `https://wa.me/${hasCountryCode ? '' : '55'}${numbers}`;
    
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else if (hour >= 18) greeting = 'Boa noite';

    const message = `Olá, ${greeting}! Estou entrando em contato para falar sobre o ${studentName}.`;
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Gestão de Efetivo</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Alunos</h1>
            <p className="text-slate-500 text-sm">Lista de estudantes, importação e exportação de dados.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleImport}
              disabled={currentUserRole === 'GUEST'}
              title={currentUserRole === 'GUEST' ? 'Apenas leitura — entre como gestor para importar' : undefined}
              className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 px-6 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition shadow-sm flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              Importar Planilha
            </button>
            <button
              onClick={openAddModal}
              disabled={currentUserRole === 'GUEST'}
              title={currentUserRole === 'GUEST' ? 'Apenas leitura — entre como gestor para cadastrar' : undefined}
              className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition shadow-lg flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" /> Cadastrar Aluno
            </button>
          </div>
        </div>

        {/* List Card */}
        <div className="glass-card overflow-hidden mt-6 flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nome ou..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2 text-sm text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
              <div className="relative w-48 shrink-0">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="glass-input w-full px-4 py-2 text-sm text-slate-800 appearance-none"
                >
                  <option value="">Todas as turmas</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-2 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Total de alunos: <span className="font-bold text-slate-800">{filteredStudents.length}</span>
              </span>
              <button
                onClick={handleExport}
                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Exportar Dados
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={currentUserRole === 'GUEST'}
                className="bg-rose-50/40 dark:bg-rose-900/10 backdrop-blur-md border border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" /> Apagar Todos
              </button>
            </div>
          </div>
          
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Turma</th>
                  <th className="px-6 py-3 font-medium">Turno</th>
                  <th className="px-6 py-3 font-medium">Contatos</th>
                  <th className="px-6 py-3 font-medium">Classe Comportamental</th>
                  <th className="px-6 py-3 font-medium text-center">Nota Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} onClick={() => currentUserRole !== 'GUEST' && openEditModal(s)} className={`transition border-b border-slate-100 last:border-0 text-slate-600 ${currentUserRole !== 'GUEST' ? 'hover:bg-slate-50 cursor-pointer' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shrink-0">
                           {s.name.charAt(0)}
                         </div>
                         <span className="truncate">{s.name}</span>
                      </td>
                      <td className="px-6 py-4">{s.class}</td>
                      <td className="px-6 py-4">{s.shift}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {s.contacts && s.contacts.length > 0 ? (
                           <div className="flex flex-col gap-1.5 mt-1">
                             {s.contacts.map((c, i) => {
                               const waLink = formatPhoneForWhatsApp(c.phone, s.name);
                               return (
                                 <div key={i} className="text-xs flex items-center gap-1.5">
                                   <span className="text-slate-400 capitalize">{c.name || 'Resp.'}:</span> 
                                   {waLink ? (
                                      <a 
                                        href={waLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium flex items-center transition"
                                      >
                                        {c.phone}
                                      </a>
                                   ) : (
                                      <span>{c.phone}</span>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                        ) : (
                           <span className="text-xs italic text-slate-400">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          getStudentBehavior(getStudentPoints(s.id)) === 'Excepcional' ? 'bg-emerald-500/10 text-emerald-600' :
                          getStudentBehavior(getStudentPoints(s.id)) === 'Ótimo' ? 'bg-blue-500/10 text-blue-600' :
                          getStudentBehavior(getStudentPoints(s.id)) === 'Bom' ? 'bg-slate-500/10 text-slate-600' :
                          getStudentBehavior(getStudentPoints(s.id)) === 'Regular' ? 'bg-yellow-500/10 text-yellow-600' :
                          getStudentBehavior(getStudentPoints(s.id)) === 'Insuficiente' ? 'bg-rose-500/10 text-rose-600' :
                          'bg-red-500/10 text-red-600'
                        }`}>
                          {getStudentBehavior(getStudentPoints(s.id))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-black ${getStudentPoints(s.id) >= 7 ? 'text-blue-600' : 'text-red-500'}`}>
                               {getStudentPoints(s.id).toFixed(1)}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-500 ${getStudentPoints(s.id) >= 7 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                 style={{ width: `${getStudentPoints(s.id) * 10}%` }}
                               />
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Novo/Editar Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full flex flex-col shadow-2xl max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingStudentId ? 'Editar Aluno' : 'Cadastrar Aluno Manualmente'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto overflow-x-hidden">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                      value={className.replace(/ [A-Z]$/i, '') || '6º Ano'}
                      onChange={(e) => {
                        const letter = className.match(/ ([A-Z])$/i)?.[1] || 'A';
                        setClassName(`${e.target.value} ${letter}`);
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
                    <input 
                      type="text"
                      maxLength={1}
                      value={className.match(/ ([A-Z])$/i)?.[1] || ''}
                      onChange={(e) => {
                        const prefix = className.replace(/ [A-Z]$/i, '') || '6º Ano';
                        setClassName(`${prefix} ${e.target.value.toUpperCase()}`.trim());
                      }}
                      className="w-1/3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Letra"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Turno *</label>
                  <select 
                    required
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Noturno">Noturno</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Matrícula</label>
                  <input 
                    type="text" 
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Endereço</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, Número, Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">CPF</label>
                  <input 
                    type="text" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
                <textarea 
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                  placeholder="Laudos, condições de saúde, etc..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600">Contatos dos Responsáveis</label>
                {contacts.map((contact, index) => {
                  const waLink = formatPhoneForWhatsApp(contact.phone, name);
                  return (
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
                    {waLink && (
                      <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition shrink-0 flex items-center justify-center" 
                        title="Falar com responsável"
                      >
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                      </a>
                    )}
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
                )})}
              </div>

              <div className="pt-4 flex justify-between gap-3 border-t border-slate-200 mt-5 pt-5">
                {editingStudentId ? (
                  <button 
                    type="button" 
                    onClick={() => { setIsDeleteConfirmOpen(true); setDeleteConfirmText(''); }}
                    className="px-4 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition font-medium flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4"/>
                    Arquivar
                  </button>
                ) : <div />}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-white transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!name || !className}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingStudentId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Arquivamento */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-orange-100">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-4">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Arquivar Aluno</h3>
            <p className="text-sm text-slate-600 mb-4">
              Esta ação removerá o aluno da visualização principal, movendo-o para a aba de arquivados. 
              Para confirmar, digite a palavra <strong>arquivar</strong> abaixo:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 mb-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Digite arquivar"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={deleteConfirmText.toLowerCase() !== 'arquivar'}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Confirmar Arquivamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Apagar Todos */}
      {isDeleteAllConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Apagar Todos Alunos</h3>
            <p className="text-sm text-slate-600 mb-4">
              ATENÇÃO: Esta ação é definitiva e removerá TODOS os alunos atuais. 
              Para confirmar, digite <strong>apagar todos</strong> abaixo:
            </p>
            <input
              type="text"
              value={deleteAllConfirmText}
              onChange={(e) => setDeleteAllConfirmText(e.target.value)}
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 mb-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Digite apagar todos"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteAllConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                disabled={deleteAllConfirmText.toLowerCase() !== 'apagar todos'}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onImport={async (studentsData) => {
          await importStudents(studentsData);
          setIsWizardOpen(false);
        }}
        geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}
      />
    </AppShell>
  );
}
