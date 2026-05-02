'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { Settings, Plus, X, Check, AlertCircle, Zap, Shield } from 'lucide-react';

type Integration = {
  id: string;
  name: string;
  description: string;
  status: 'conectado' | 'desconectado' | 'erro';
  apiKey?: string;
  apiUrl?: string;
  lastSync?: string;
};

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'fica',
    name: 'FICA',
    description: 'Integração com o sistema FICA para transferência de dados disciplinares',
    color: 'blue'
  },
  {
    id: 'segeduca',
    name: 'SEGEDUCA',
    description: 'Sincronização com SEGEDUCA para gestão de matrículas e turmas',
    color: 'purple'
  },
  {
    id: 'bo',
    name: 'Boletim de Ocorrência (B.O)',
    description: 'Integração com sistema de B.O para registro de ocorrências policiais',
    color: 'red'
  },
  {
    id: 'api_ia',
    name: 'API de IA',
    description: 'Análise automática de padrões comportamentais usando inteligência artificial',
    color: 'indigo'
  },
];

export default function Integracoes() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'fica',
      name: 'FICA',
      description: 'Integração com o sistema FICA',
      status: 'desconectado',
    },
    {
      id: 'segeduca',
      name: 'SEGEDUCA',
      description: 'Sincronização com SEGEDUCA',
      status: 'conectado',
      lastSync: '2026-05-02 10:30',
    },
    {
      id: 'bo',
      name: 'Boletim de Ocorrência (B.O)',
      description: 'Integração com sistema de B.O',
      status: 'desconectado',
    },
    {
      id: 'api_ia',
      name: 'API de IA',
      description: 'Análise com inteligência artificial',
      status: 'conectado',
      lastSync: '2026-05-02 14:15',
    },
  ]);

  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ apiKey: '', apiUrl: '' });

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? {
              ...int,
              status: 'conectado' as const,
              apiKey: formData.apiKey,
              apiUrl: formData.apiUrl,
              lastSync: new Date().toLocaleString('pt-BR'),
            }
          : int
      )
    );
    setShowForm(null);
    setFormData({ apiKey: '', apiUrl: '' });
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, status: 'desconectado' as const, apiKey: undefined, apiUrl: undefined }
          : int
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'desconectado':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      case 'erro':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'Conectado';
      case 'desconectado':
        return 'Desconectado';
      case 'erro':
        return 'Erro';
      default:
        return '';
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">INTEGRAÇÕES</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Integrações do Sistema</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure e gerencie as conexões com sistemas externos</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">API Key e URLs confidenciais</p>
            <p>Mantenha suas credenciais seguras. Nunca compartilhe suas API keys com terceiros.</p>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{integration.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{integration.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(integration.status)}`}>
                    {getStatusLabel(integration.status)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {integration.status === 'conectado' ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                      <Check className="w-4 h-4" />
                      Integração ativa
                    </div>
                    {integration.lastSync && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Última sincronização: {integration.lastSync}
                      </p>
                    )}
                    <div className="space-y-2">
                      {integration.apiUrl && (
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                          {integration.apiUrl}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition-colors"
                    >
                      Desconectar
                    </button>
                  </>
                ) : (
                  <>
                    {showForm === integration.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Chave de API"
                            value={formData.apiKey}
                            onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            URL da API
                          </label>
                          <input
                            type="text"
                            placeholder="https://api.exemplo.com"
                            value={formData.apiUrl}
                            onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConnect(integration.id)}
                            className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors"
                          >
                            Conectar
                          </button>
                          <button
                            onClick={() => setShowForm(null)}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowForm(integration.id)}
                        className="w-full px-3 py-2 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Conectar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Configurações Avançadas</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Sincronização automática</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Notificações de erros</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Modo de teste</span>
            </label>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
