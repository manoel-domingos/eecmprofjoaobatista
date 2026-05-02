'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'Alunos',
    question: 'Como adicionar um novo aluno ao sistema?',
    answer: 'Para adicionar um novo aluno, acesse o menu "Alunos" > "Lista de Alunos" e clique no botão "+ Adicionar Aluno". Preencha os dados solicitados e clique em "Salvar".'
  },
  {
    id: '2',
    category: 'Alunos',
    question: 'Como importar alunos em massa?',
    answer: 'Na página de alunos, clique em "Importar Planilha" e selecione um arquivo Excel ou CSV. O sistema irá analisar a estrutura automaticamente e importar os dados.'
  },
  {
    id: '3',
    category: 'Ocorrências',
    question: 'Quais são os tipos de ocorrências disponíveis?',
    answer: 'Os tipos de ocorrências variam conforme o regimento da escola. Você pode consultar a lista completa em "Disciplina" > "Registro Disciplinar".'
  },
  {
    id: '4',
    category: 'Ocorrências',
    question: 'Como registrar uma ocorrência?',
    answer: 'Acesse "Disciplina" > "Registro Disciplinar", clique em "+ Nova Ocorrência", selecione o aluno, digite a descrição e escolha o tipo de ocorrência. Clique em "Registrar" para salvar.'
  },
  {
    id: '5',
    category: 'Comportamento',
    question: 'Como registrar um elogio?',
    answer: 'Vá em "Comportamento" > "Elogios e Bonificações" e clique em "+ Novo Elogio". Selecione o aluno, descreva o motivo e salve.'
  },
  {
    id: '6',
    category: 'Relatórios',
    question: 'Como gerar um relatório?',
    answer: 'Acesse "Relatórios" e selecione o tipo de relatório desejado. Configure os filtros (período, turma, turno) e clique em "Gerar Relatório".'
  },
  {
    id: '7',
    category: 'Técnico',
    question: 'Como sincronizar com o banco de dados?',
    answer: 'A sincronização é automática. Se precisar sincronizar manualmente, clique no botão "Sincronizar" (ícone de seta circular) no canto superior direito.'
  },
  {
    id: '8',
    category: 'Técnico',
    question: 'Como ativar o modo escuro?',
    answer: 'Clique no ícone de sol/lua no canto superior direito para alternar entre modo claro e escuro.'
  },
];

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = ['todos', ...new Set(FAQ_ITEMS.map(item => item.category))];

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Perguntas Frequentes</h1>
          <p className="text-slate-600 dark:text-slate-400">Encontre respostas para as dúvidas mais comuns sobre o sistema</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar dúvidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              {cat === 'todos' ? 'Todas as categorias' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 mb-12">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 mt-0.5 shrink-0 transition-transform ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-start gap-3 justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-tight pr-2">
                        {item.question}
                      </h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </button>

                {expandedId === item.id && (
                  <div className="px-5 pb-5 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Nenhuma pergunta encontrada com esses critérios.</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Não encontrou a resposta?</h3>
          <p className="mb-4 opacity-90">Entre em contato com o suporte para mais informações</p>
          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Abrir Ticket de Suporte
          </button>
        </div>
      </div>
    </div>
  );
}
