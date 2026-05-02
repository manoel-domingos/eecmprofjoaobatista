'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { FileText, Download, Eye, BookOpen, Files, Badge } from 'lucide-react';

type Document = {
  id: string;
  title: string;
  category: 'manual' | 'regimento' | 'resolucao' | 'outro';
  description: string;
  size: string;
  dateAdded: string;
  fileUrl?: string;
};

const DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Manual do Aluno',
    category: 'manual',
    description: 'Guia completo com direitos, deveres e normas da escola',
    size: '2.4 MB',
    dateAdded: '2026-01-15',
    fileUrl: '#'
  },
  {
    id: '2',
    title: 'Regimento Escolar',
    category: 'regimento',
    description: 'Regulamento oficial da Escola Estadual Cívico-Militar Prof. João Batista',
    size: '3.1 MB',
    dateAdded: '2026-01-10',
    fileUrl: '#'
  },
  {
    id: '3',
    title: 'Resolução sobre Disciplina',
    category: 'resolucao',
    description: 'Normas disciplinares e procedimentos de advertência',
    size: '1.8 MB',
    dateAdded: '2025-12-20',
    fileUrl: '#'
  },
  {
    id: '4',
    title: 'Código de Conduta',
    category: 'outro',
    description: 'Código de conduta para alunos e servidores',
    size: '2.1 MB',
    dateAdded: '2025-12-15',
    fileUrl: '#'
  },
];

export default function Documentos() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { value: 'todos', label: 'Todos', count: DOCUMENTS.length },
    { value: 'manual', label: 'Manuais', count: DOCUMENTS.filter(d => d.category === 'manual').length },
    { value: 'regimento', label: 'Regimentos', count: DOCUMENTS.filter(d => d.category === 'regimento').length },
    { value: 'resolucao', label: 'Resoluções', count: DOCUMENTS.filter(d => d.category === 'resolucao').length },
    { value: 'outro', label: 'Outros', count: DOCUMENTS.filter(d => d.category === 'outro').length },
  ];

  const filteredDocuments = selectedCategory === 'todos' 
    ? DOCUMENTS 
    : DOCUMENTS.filter(d => d.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'manual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'regimento': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'resolucao': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'manual': return 'Manual';
      case 'regimento': return 'Regimento';
      case 'resolucao': return 'Resolução';
      default: return 'Documento';
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">BIBLIOTECA</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Documentos</h1>
          <p className="text-slate-500 dark:text-slate-400">Acesso a manuais, regimentos e documentos oficiais da instituição</p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
              <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedCategory === cat.value 
                  ? 'bg-blue-600' 
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 mt-1">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2">{doc.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{doc.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(doc.category)}`}>
                  {getCategoryLabel(doc.category)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{doc.size}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors font-medium text-sm">
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                Adicionado em {new Date(doc.dateAdded).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <Files className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum documento encontrado nesta categoria</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
