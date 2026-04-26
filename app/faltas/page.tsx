'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAppContext } from '@/lib/store';
import { DisciplineRule } from '@/lib/data';
import { BookOpen, Search, Edit2, X } from 'lucide-react';

export default function FaltasDisciplinares() {
  const { rules, updateRule } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('Todas');
  const [editingRule, setEditingRule] = useState<DisciplineRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<any>('Leve');
  const [points, setPoints] = useState(0);
  const [measure, setMeasure] = useState('');

  const filteredRules = rules
    .filter(r => {
      const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.code.toString().includes(searchTerm);
      const matchesSeverity = selectedSeverity === 'Todas' || r.severity === selectedSeverity;
      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => a.code - b.code);

  const openEditModal = (r: DisciplineRule) => {
    setEditingRule(r);
    setDescription(r.description);
    setSeverity(r.severity);
    setPoints(r.points);
    setMeasure(r.measure);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    updateRule(editingRule.code, {
      description,
      severity,
      points,
      measure
    });

    setIsModalOpen(false);
    setEditingRule(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <div className="flex items-center gap-2 text-blue-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Base de Dados</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Faltas Disciplinares</h1>
            <p className="text-slate-500 text-sm">Regulamento com as infrações e pontuações correspondentes.</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
           <div className="px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
             Leve: -0.1 (Oral) ou -0.3 (Escrita)
           </div>
           <div className="px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
             Média: -0.3 (Escrita)
           </div>
           <div className="px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
             Grave: -0.5 por dia (Suspensão)
           </div>
        </div>

        {/* List Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex p-1 bg-slate-100 rounded-lg shrink-0">
              {['Todas', 'Leve', 'Media', 'Grave'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeverity(s)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                    selectedSeverity === s
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'Media' ? 'Média' : s}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Buscar por código ou texto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3 font-medium w-20">Código</th>
                  <th className="px-6 py-3 font-medium min-w-[300px] w-full">Descrição da Falta (Artigo)</th>
                  <th className="px-6 py-3 font-medium">Gravidade</th>
                  <th className="px-6 py-3 font-medium text-center">Pontos</th>
                  <th className="px-6 py-3 font-medium">Medida Aplicada</th>
                  <th className="px-6 py-3 font-medium w-16 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma infração encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((r) => (
                    <tr key={r.code} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 text-center">{r.code}</td>
                      <td className="px-6 py-4 whitespace-normal">{r.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                            r.severity === 'Leve' ? 'bg-blue-500/10 text-blue-400' :
                            r.severity === 'Media' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                        }`}>
                            {r.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-red-400">{r.points}</td>
                      <td className="px-6 py-4 text-slate-500">{r.measure}</td>
                      <td className="px-6 py-4 text-center text-slate-400">
                         <button 
                           onClick={() => openEditModal(r)}
                           className="hover:text-slate-800 transition p-1"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-500" />
                Editar Artigo {editingRule?.code}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] overflow-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Gravidade</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Media">Média</option>
                    <option value="Grave">Grave</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Pontuação</label>
                   <input 
                     type="number" 
                     step="0.1"
                     value={points}
                     onChange={(e) => setPoints(parseFloat(e.target.value))}
                     className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Medida Administrativa</label>
                <input 
                  type="text" 
                  value={measure}
                  onChange={(e) => setMeasure(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-white transition font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
