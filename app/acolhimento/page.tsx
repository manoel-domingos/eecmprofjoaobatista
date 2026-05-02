'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { Heart, AlertCircle, MessageSquare, User, Calendar, Plus, Ticket } from 'lucide-react';
import { useAppContext } from '@/lib/store';

type AcolhimentoTicket = {
  id: string;
  studentId: string;
  studentName: string;
  occurrenceType: 'briga' | 'bullying' | 'trauma' | 'outro';
  description: string;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberto' | 'em_acolhimento' | 'fechado';
  createdAt: string;
  notes?: string;
};

const OCCURRENCE_TYPES = [
  { value: 'briga', label: 'Briga/Conflito', icon: '⚔️' },
  { value: 'bullying', label: 'Bullying', icon: '😔' },
  { value: 'trauma', label: 'Situação Traumática', icon: '💔' },
  { value: 'outro', label: 'Outro', icon: '❓' },
];

export default function Acolhimento() {
  const { students, occurrences } = useAppContext();
  const [tickets, setTickets] = useState<AcolhimentoTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('aberto');
  const [formData, setFormData] = useState({
    studentId: '',
    occurrenceType: 'outro' as const,
    description: '',
    priority: 'media' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    const newTicket: AcolhimentoTicket = {
      id: `acol-${Date.now()}`,
      studentId: formData.studentId,
      studentName: student.name,
      occurrenceType: formData.occurrenceType,
      description: formData.description,
      priority: formData.priority,
      status: 'aberto',
      createdAt: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]);
    setFormData({ studentId: '', occurrenceType: 'outro', description: '', priority: 'media' });
    setShowForm(false);
  };

  const filteredTickets = tickets.filter(t => t.status === selectedStatus);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">ACOLHIMENTO</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Programa de Acolhimento</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gerenciamento de tickets de acolhimento para alunos em situações vulneráveis</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Ticket
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aluno *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.class}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Ocorrência *</label>
                  <select
                    value={formData.occurrenceType}
                    onChange={(e) => setFormData({...formData, occurrenceType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    {OCCURRENCE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prioridade *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva a situação do aluno..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  Criar Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {['aberto', 'em_acolhimento', 'fechado'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                selectedStatus === status
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {status === 'aberto' && 'Abertos'}
              {status === 'em_acolhimento' && 'Em Acolhimento'}
              {status === 'fechado' && 'Fechados'}
              <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {tickets.filter(t => t.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          {ticket.studentName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{ticket.description}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {OCCURRENCE_TYPES.find(t => t.value === ticket.occurrenceType)?.label}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {ticket.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum ticket neste status</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
