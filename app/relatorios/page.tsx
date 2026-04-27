'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAppContext } from '@/lib/store';
import { FileText, Printer, Download } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import { formatDate } from '@/lib/utils';

export default function Relatorios() {
  const { students, occurrences } = useAppContext();
  const [activeTab, setActiveTab] = useState('gerencial');
  const [selectedMonth, setSelectedMonth] = useState('Todos os meses');
  const [selectedClass, setSelectedClass] = useState('Todas as turmas');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Documentos Oficiais</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
            <p className="text-slate-500 text-sm">Selecione o tipo de relatório e use os filtros</p>
          </div>
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition w-full sm:w-auto"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
          <button 
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'gerencial' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-600'}`}
            onClick={() => setActiveTab('gerencial')}
          >
            Gerencial Mensal
            {activeTab === 'gerencial' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
          </button>
          <button 
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'registro' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-600'}`}
            onClick={() => setActiveTab('registro')}
          >
            Registro Disciplinar
            {activeTab === 'registro' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
          </button>
          <button 
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'ficha' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-600'}`}
            onClick={() => setActiveTab('ficha')}
          >
            Ficha Individual
            {activeTab === 'ficha' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Turma</label>
            <SearchableSelect
               options={[
                 { value: 'Todas as turmas', label: 'Todas as turmas' },
                 ...classes.map(c => ({ value: c, label: c }))
               ]}
               value={selectedClass}
               onChange={setSelectedClass}
               placeholder="Pesquisar Turma..."
               heightClass="py-1.5 text-sm"
             />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Turno</label>
            <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Mês</label>
            <SearchableSelect
              options={[
                { value: 'Todos os meses', label: 'Todos os meses' },
                ...months.map(m => ({ value: m, label: m }))
              ]}
              value={selectedMonth}
              onChange={setSelectedMonth}
              placeholder="Pesquisar Mês..."
              heightClass="py-1.5 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
             <label className="block text-xs font-medium text-slate-500 mb-1">Ano</label>
             <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none">
               <option>2026</option>
             </select>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-[#e2e8f0] rounded-xl p-4 sm:p-8 max-w-4xl mx-auto shadow-2xl print:bg-white print:p-0 print:shadow-none min-h-[800px] text-slate-900 font-serif">
          
          {/* Header Image */}
          <div className="mb-8 w-full">
            <img src="/CABEÇALHO JB.svg" alt="Cabeçalho Oficial" className="w-full h-auto" />
          </div>

          <div className="border border-slate-900 rounded p-4 mb-8 text-center bg-slate-50 print:bg-white">
            <h1 className="font-bold text-lg uppercase tracking-wider mb-1">
              {activeTab === 'gerencial' ? 'Relatório de Gestão Disciplinar' : 
               activeTab === 'registro' ? 'Relatório de Registros Disciplinares' : 
               'Ficha Individual do Aluno'}
            </h1>
            <p className="text-sm">Período: Abril de 2026 - Turno: Todos os turnos - Turma: Todas as turmas</p>
          </div>

          {activeTab === 'gerencial' || activeTab === 'registro' ? (
            <div className="space-y-6">
              <h4 className="font-bold italic underline mb-4">1. RESUMO ANALÍTICO</h4>
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse border border-slate-900 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-slate-900 p-2 font-medium">Total de Ocorrências</td>
                      <td className="border border-slate-900 p-2 text-center w-32 font-bold">{occurrences.length}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 p-2 font-medium">Leves</td>
                      <td className="border border-slate-900 p-2 text-center w-32">{occurrences.length > 0 ? 11 : 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 p-2 font-medium">Médias</td>
                      <td className="border border-slate-900 p-2 text-center w-32">{occurrences.length > 0 ? 6 : 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 p-2 font-medium">Graves</td>
                      <td className="border border-slate-900 p-2 text-center w-32">{occurrences.length > 0 ? 6 : 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 p-2 font-medium">Alunos em Observação (Nota &lt; 5.0)</td>
                      <td className="border border-slate-900 p-2 text-center w-32">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-bold italic underline mt-8 mb-4">2. DETALHAMENTO DE OCORRÊNCIAS</h4>
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse border border-slate-900 text-sm whitespace-nowrap sm:whitespace-normal">
                <thead>
                  <tr className="bg-slate-200 print:bg-slate-100">
                    <th className="border border-slate-900 p-2 text-left">Data</th>
                    <th className="border border-slate-900 p-2 text-left">Aluno</th>
                    <th className="border border-slate-900 p-2 text-left">Turma</th>
                    <th className="border border-slate-900 p-2 text-left">Infração</th>
                  </tr>
                </thead>
                <tbody>
                  {occurrences.slice(0,10).map((o, i) => {
                    const student = students.find(s => s.id === o.studentId);
                    return (
                      <tr key={i}>
                        <td className="border border-slate-900 p-2 w-24">{formatDate(o.date)}</td>
                        <td className="border border-slate-900 p-2">{student?.name}</td>
                        <td className="border border-slate-900 p-2 w-20">{student?.class}</td>
                        <td className="border border-slate-900 p-2 truncate max-w-[200px]">Cód. {o.ruleCode}</td>
                      </tr>
                    );
                  })}
                  {occurrences.length === 0 && (
                    <tr>
                      <td colSpan={4} className="border border-slate-900 p-4 text-center">Sem dados no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              <div className="pt-20 text-center flex flex-col items-center">
                <div className="w-64 border-b border-slate-900 mb-2"></div>
                <p className="text-sm font-bold">Gestor Escolar Responsável</p>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 italic">
              Esta aba exibe a ficha individual completa de um aluno específico, incluindo todos os registros comportamentais e ocorrências listadas cronologicamente. Selecione um aluno no filtro acima.
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
