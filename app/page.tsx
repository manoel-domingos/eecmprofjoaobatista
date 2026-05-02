'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import CustomSelect from '@/components/CustomSelect';
import { useAppContext } from '@/lib/store';
import { FileText, AlertTriangle, Users, Star, ArrowRight, Award, TrendingUp, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const { students, occurrences, praises, rules, getStudentPoints } = useAppContext();

  const [selectedMonth, setSelectedMonth] = useState('Selecionar...');
  const [selectedClass, setSelectedClass] = useState('Todas as turmas');
  const [selectedShift, setSelectedShift] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('2026');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  const filteredOccurrences = occurrences.filter(o => {
    const defaultDate = new Date(o.date);
    const monthIndex = parseInt(o.date.split('-')[1]) - 1; 
    const month = months[monthIndex] || months[defaultDate.getMonth()];
    
    const student = students.find(s => s.id === o.studentId);
    const className = student?.class || '';
    const shift = student?.shift || '';

    const matchMonth = selectedMonth === 'Selecionar...' || selectedMonth === '' || month.toLowerCase() === selectedMonth.toLowerCase();
    const matchClass = selectedClass === 'Todas as turmas' || selectedClass === '' || className.toLowerCase() === selectedClass.toLowerCase();
    const matchShift = selectedShift === 'Todos' || shift.toLowerCase() === selectedShift.toLowerCase();
    const matchYear = o.date.startsWith(selectedYear);
    
    return matchMonth && matchClass && matchShift && matchYear;
  });

  const totalOccurrences = filteredOccurrences.length;
  
  const occurrencesWithSeverity = filteredOccurrences.map(o => {
    const rule = rules.find(r => r.code === o.ruleCode);
    return { ...o, severity: rule?.severity || 'Leve' };
  });

  const graveCount = occurrencesWithSeverity.filter(o => o.severity === 'Grave').length;
  const mediaCount = occurrencesWithSeverity.filter(o => o.severity === 'Media').length;
  const leveCount = occurrencesWithSeverity.filter(o => o.severity === 'Leve').length;
  
  const gravePercent = totalOccurrences > 0 ? Math.round((graveCount / totalOccurrences) * 100) : 0;
  
  const impactedStudentsCount = new Set(filteredOccurrences.map(o => o.studentId)).size;
  const impactedStudentsPercent = students.length > 0 ? Math.round((impactedStudentsCount / students.length) * 100) : 0;
  
  // calculate total average
  let totalPointsAccumulated = students.reduce((acc, student) => acc + getStudentPoints(student.id), 0);
  const averagePointsStr = students.length > 0 ? (totalPointsAccumulated / students.length).toFixed(1) : '10.0';
  const averagePoints = parseFloat(averagePointsStr);
  const studentsAbove7 = students.filter(s => getStudentPoints(s.id) >= 7.0).length;
  const percentAbove7 = students.length > 0 ? Math.round((studentsAbove7 / students.length) * 100) : 0;

  const severityData = [
    { name: 'Leve', value: leveCount, color: '#10b981' }, // green
    { name: 'Média', value: mediaCount, color: '#f59e0b' }, // yellow
    { name: 'Grave', value: graveCount, color: '#ef4444' } // red
  ];

  // Dummy monthly data for the chart based on occurrences
  const monthlyData = months.map((m, i) => {
    const count = occurrencesWithSeverity.filter(o => {
      const monthIndex = parseInt(o.date.split('-')[1]) - 1;
      return monthIndex === i;
    }).length;
    return { 
      name: m.substring(0, 3), 
      ocorrencias: count,
      graves: occurrencesWithSeverity.filter(o => parseInt(o.date.split('-')[1]) - 1 === i && o.severity === 'Grave').length
    };
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#5e6ad2]">PAINEL EXECUTIVO</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">Dashboard Disciplinar</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Visão consolidada • Escola Cívico-Militar • {selectedYear}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            <div className="flex flex-col gap-1 w-full sm:w-28">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Ano</label>
              <CustomSelect 
                options={[
                  { value: '2026', label: '2026' },
                  { value: '2025', label: '2025' }
                ]}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-40">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Mês</label>
              <CustomSelect 
                options={[
                  { value: 'Selecionar...', label: 'Selecionar...' },
                  ...months.map(m => ({ value: m, label: m }))
                ]}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-36">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Turno</label>
              <CustomSelect 
                options={[
                  { value: 'Todos', label: 'Todos' },
                  { value: 'Matutino', label: 'Matutino' },
                  { value: 'Vespertino', label: 'Vespertino' },
                  { value: 'Noturno', label: 'Noturno' }
                ]}
                value={selectedShift}
                onChange={setSelectedShift}
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-48">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Turma</label>
              <CustomSelect 
                options={[
                  { value: 'Todas as turmas', label: 'Todas as turmas' },
                  ...classes.map(c => ({ value: c, label: c }))
                ]}
                value={selectedClass}
                onChange={setSelectedClass}
              />
            </div>
          </div>
        </div>

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 flex flex-col justify-between h-36 rounded-2xl border border-blue-200/50 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/5 hover:bg-blue-100/80 dark:hover:bg-blue-500/15 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-9 h-9 bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1">Total de Ocorrências</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalOccurrences}</p>
              </div>
              <p className="text-blue-600/50 dark:text-blue-400/50 text-xs mt-1 font-medium">No período selecionado</p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between h-36 rounded-2xl border border-red-200/50 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5 hover:bg-red-100/80 dark:hover:bg-red-500/15 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-9 h-9 bg-white dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1">Casos Graves</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{graveCount}</p>
              </div>
              <p className="text-red-600/50 dark:text-red-400/50 text-xs mt-1 font-medium">{gravePercent}% do total</p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between h-36 rounded-2xl border border-purple-200/50 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/5 hover:bg-purple-100/80 dark:hover:bg-purple-500/15 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-9 h-9 bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider mb-1">Alunos com Registros</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{impactedStudentsCount}</p>
              </div>
              <p className="text-purple-600/50 dark:text-purple-400/50 text-xs mt-1 font-medium">de {students.length} alunos - {impactedStudentsPercent}%</p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between h-36 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/15 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="w-9 h-9 bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">Nota Média Geral</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{averagePointsStr}</p>
              </div>
              <p className="text-emerald-600/50 dark:text-emerald-400/50 text-xs mt-1 font-medium">{percentAbove7}% com nota &gt; 7.0</p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(() => {
          const criticalStudents = students.map(s => ({...s, currentPoints: getStudentPoints(s.id)})).filter(s => s.currentPoints < 5.0).sort((a,b) => a.currentPoints - b.currentPoints);
          if (criticalStudents.length === 0) return null;
          return (
            <div className="bg-red-50 dark:bg-[#2b1616] border border-red-200 dark:border-red-900/50 rounded-2xl p-5 mb-2 mt-4 shadow-sm">
              <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Atenção Crítica: Alunos Próximos de Suspensão / Desligamento (Abaixo de 5.0 pts)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {criticalStudents.slice(0, 8).map(s => (
                  <div key={s.id} className="bg-white dark:bg-[#1a1f2e] p-3 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex justify-between items-center hover:-translate-y-0.5 transition-all duration-300">
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.class}</p>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded text-xs shrink-0">
                      {s.currentPoints.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Row 2: Bento Grid Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          {/* Disciplina */}
          <div className="glass-card p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-slate-800/50 rounded-lg">
                   <FileText className="text-blue-500 dark:text-blue-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white font-bold">Disciplina</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Ocorrências registradas</p>
                </div>
              </div>
              <Link 
                href={`/registro-disciplinar?year=${selectedYear}&month=${selectedMonth}&shift=${selectedShift}&class=${selectedClass}`}
                className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/20"
              >
                Ver tudo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 flex-1 items-center">
              <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-2xl flex flex-col items-center justify-center border border-emerald-500/20">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{leveCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-500 font-semibold mt-1">Leve</span>
              </div>
              <div className="bg-amber-500/10 dark:bg-amber-500/20 p-3 rounded-2xl flex flex-col items-center justify-center border border-amber-500/20">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{mediaCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-500 font-semibold mt-1">Média</span>
              </div>
              <div className="bg-red-500/10 dark:bg-red-500/20 p-3 rounded-2xl flex flex-col items-center justify-center border border-red-500/20">
                <span className="text-xl font-bold text-red-600 dark:text-red-400">{graveCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-red-700 dark:text-red-500 font-semibold mt-1">Grave</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Nota comportamental média</span>
              <span className={`font-bold ${averagePoints >= 7 ? 'text-emerald-600 dark:text-emerald-400' : averagePoints >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {averagePointsStr} • {averagePoints >= 7 ? 'Bom' : averagePoints >= 5 ? 'Atenção' : 'Crítico'}
              </span>
            </div>
          </div>

          {/* Elogios e Bonificações */}
          <div className="glass-card p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-slate-800/50 rounded-lg">
                   <Award className="text-amber-500 dark:text-amber-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white font-bold">Elogios e Bonificações</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Reconhecimentos positivos</p>
                </div>
              </div>
              <Link 
                href={`/elogios?year=${selectedYear}&month=${selectedMonth}&shift=${selectedShift}&class=${selectedClass}`}
                className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              >
                Ver tudo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 flex-1 items-center">
              <div className="bg-slate-50 dark:bg-[#202832] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{praises?.length || 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-1">Total</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1e2a24] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">0</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-1">Alunos</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1f2430] p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">0</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-1">Média/ST</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-center items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">{praises?.length > 0 ? `${praises.length} elogios no período` : 'Nenhum elogio no período'}</span>
            </div>
          </div>

        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 dark:text-white font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Tendência Mensal de Ocorrências
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedYear}</span>
            </div>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOcorrencias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGraves" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="ocorrencias" name="Totais" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOcorrencias)" />
                  <Area type="monotone" dataKey="graves" name="Graves" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGraves)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col">
            <h3 className="text-slate-800 dark:text-white font-bold mb-6 text-center lg:text-left">Distribuição por Gravidade</h3>
            <div className="flex-1 w-full flex items-center justify-center pb-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

