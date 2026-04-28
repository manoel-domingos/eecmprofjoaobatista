'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, ArrowLeft, Database, Sparkles, Server } from 'lucide-react';

type ServerStatus = {
  gemini: { configured: boolean; reachable: boolean; error: string | null };
  database: { configured: boolean };
  server: { nodeEnv: string; timestamp: string };
};

type CheckState = 'loading' | 'ok' | 'warn' | 'error';

function StatusBadge({ state }: { state: CheckState }) {
  if (state === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        <Loader2 className="w-3 h-3 animate-spin" /> verificando
      </span>
    );
  }
  if (state === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-3 h-3" /> conectado
      </span>
    );
  }
  if (state === 'warn') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <AlertCircle className="w-3 h-3" /> não configurado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
      <XCircle className="w-3 h-3" /> erro
    </span>
  );
}

type Card = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  state: CheckState;
  detail: React.ReactNode;
  hint?: string;
};

export default function StatusPage() {
  const [server, setServer] = useState<ServerStatus | null>(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const [supaReachable, setSupaReachable] = useState<CheckState>('loading');
  const [supaDetail, setSupaDetail] = useState<string>('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  async function loadServer() {
    setServerLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ServerStatus;
      setServer(json);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setServerLoading(false);
    }
  }

  async function loadSupabase() {
    setSupaReachable('loading');
    setSupaDetail('');
    if (!supabaseUrl || !supabaseAnonKey) {
      setSupaReachable('warn');
      setSupaDetail('Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY ainda não foram preenchidas.');
      return;
    }
    let url = supabaseUrl;
    if (!url.startsWith('http')) url = `https://${url}`;
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: supabaseAnonKey },
      });
      if (res.ok) {
        setSupaReachable('ok');
        setSupaDetail(`Endpoint respondeu OK em ${url.replace(/^https?:\/\//, '')}`);
      } else {
        setSupaReachable('error');
        setSupaDetail(`Resposta HTTP ${res.status} de ${url}`);
      }
    } catch (err) {
      setSupaReachable('error');
      setSupaDetail(err instanceof Error ? err.message : String(err));
    }
  }

  function refreshAll() {
    loadServer();
    loadSupabase();
  }

  useEffect(() => {
    setTimeout(refreshAll, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supabaseCard: Card = {
    icon: <Database className="w-5 h-5" />,
    title: 'Supabase',
    subtitle: 'Banco de dados e autenticação',
    state: supaReachable,
    detail: supaDetail || (supaReachable === 'loading' ? 'Verificando…' : ''),
    hint:
      supaReachable === 'warn'
        ? 'Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no painel de Secrets.'
        : undefined,
  };

  const geminiState: CheckState = serverLoading
    ? 'loading'
    : !server
      ? 'error'
      : !server.gemini.configured
        ? 'warn'
        : server.gemini.reachable
          ? 'ok'
          : 'error';

  const geminiCard: Card = {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Gemini AI',
    subtitle: 'Assistente inteligente do sistema',
    state: geminiState,
    detail: serverLoading
      ? 'Verificando…'
      : !server
        ? serverError || 'Não foi possível consultar o servidor.'
        : !server.gemini.configured
          ? 'A variável GEMINI_API_KEY ainda não foi configurada.'
          : server.gemini.reachable
            ? 'Chave válida, modelos acessíveis.'
            : server.gemini.error || 'Chave configurada mas a API recusou.',
    hint:
      geminiState === 'warn'
        ? 'Adicione GEMINI_API_KEY no painel de Secrets para liberar o assistente.'
        : undefined,
  };

  const dbState: CheckState = serverLoading
    ? 'loading'
    : !server
      ? 'error'
      : server.database.configured
        ? 'ok'
        : 'warn';

  const dbCard: Card = {
    icon: <Server className="w-5 h-5" />,
    title: 'Banco interno',
    subtitle: 'PostgreSQL do Replit (DATABASE_URL)',
    state: dbState,
    detail: serverLoading
      ? 'Verificando…'
      : !server
        ? 'Servidor indisponível.'
        : server.database.configured
          ? 'Disponível para uso, caso futuramente queiramos migrar do Supabase.'
          : 'Nenhuma conexão configurada.',
  };

  const cards = [supabaseCard, geminiCard, dbCard];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> voltar
          </Link>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> atualizar
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Status das integrações</h1>
          <p className="text-sm text-slate-500 mt-1">
            Diagnóstico rápido das conexões externas usadas pelo sistema.
          </p>
        </header>

        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-slate-900">{card.title}</h2>
                      <StatusBadge state={card.state} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                    {card.detail && (
                      <p className="text-sm text-slate-600 mt-2 break-words">{card.detail}</p>
                    )}
                    {card.hint && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 mt-2 inline-block">
                        {card.hint}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {server?.server && (
          <p className="mt-8 text-xs text-slate-400 text-center">
            Servidor: {server.server.nodeEnv} · última verificação{' '}
            {new Date(server.server.timestamp).toLocaleTimeString('pt-BR')}
          </p>
        )}

        <div className="mt-10 p-5 rounded-xl bg-slate-100 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Como adicionar as chaves
          </h3>
          <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>Abra o painel <strong>Secrets</strong> aqui no Replit.</li>
            <li>Adicione, uma por uma, as chaves marcadas como <em>não configurado</em> acima.</li>
            <li>Volte aqui e clique em <strong>atualizar</strong> para conferir.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
