'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Brain, X, Send, Loader2, Sparkles, ChevronDown, Activity, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  durationMs?: number;
  streaming?: boolean;
}

interface LogEntry {
  id: number;
  type: string;
  input: string;
  output: string;
  durationMs: number;
  timestamp: Date;
  status: 'ok' | 'error' | 'streaming';
}

type Panel = 'chat' | 'logs';

// Utilitário de streaming SSE reutilizável pelo resto da aplicação
export async function streamAI(
  type: string,
  payload: Record<string, any>,
  onDelta: (delta: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
    signal,
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido.' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.error) throw new Error(json.error);
        if (json.delta) {
          full += json.delta;
          onDelta(json.delta);
        }
        if (json.done) return json.result ?? full;
      } catch (e: any) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }
  return full;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a ARIA, assistente virtual da E.E. Cívico-Militar Prof. João Batista. Como posso ajudar?',
      timestamp: new Date(),
    },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logId = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    if (activePanel === 'chat') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, logs, isOpen, activePanel]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmed = text.trim();
    const ts = new Date();
    const currentLogId = ++logId.current;
    const startTime = Date.now();

    setMessages(prev => [...prev, { role: 'user', content: trimmed, timestamp: ts }]);
    setInput('');
    setIsLoading(true);

    // Adiciona mensagem do assistente vazia para streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date(), streaming: true }]);

    // Log de entrada (streaming)
    setLogs(prev => [...prev, {
      id: currentLogId,
      type: 'chat',
      input: trimmed,
      output: '',
      durationMs: 0,
      timestamp: ts,
      status: 'streaming',
    }]);

    abortRef.current = new AbortController();

    try {
      const reply = await streamAI(
        'chat',
        { message: trimmed },
        (delta) => {
          // Atualiza mensagem e log em tempo real a cada delta
          setMessages(prev => prev.map((m, i) =>
            i === prev.length - 1 && m.streaming
              ? { ...m, content: m.content + delta }
              : m
          ));
          setLogs(prev => prev.map(l =>
            l.id === currentLogId
              ? { ...l, output: l.output + delta }
              : l
          ));
        },
        abortRef.current.signal
      );

      const durationMs = Date.now() - startTime;
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 && m.streaming
          ? { ...m, content: reply, streaming: false, durationMs }
          : m
      ));
      setLogs(prev => prev.map(l =>
        l.id === currentLogId
          ? { ...l, output: reply, durationMs, status: 'ok' }
          : l
      ));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const durationMs = Date.now() - startTime;
      const errMsg = err?.message || 'Erro ao processar. Tente novamente.';
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 && m.streaming
          ? { ...m, content: errMsg, streaming: false, durationMs }
          : m
      ));
      setLogs(prev => prev.map(l =>
        l.id === currentLogId
          ? { ...l, output: errMsg, durationMs, status: 'error' }
          : l
      ));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading]);

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleSend = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const suggestions = [
    'O que é o Art. 4 do regimento?',
    'Como registrar uma ocorrência?',
    'Diferença entre advertência oral e escrita?',
  ];

  const streamingCount = logs.filter(l => l.status === 'streaming').length;

  return (
    <>
      {/* Botao FAB */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? 'Fechar ARIA' : 'Abrir assistente ARIA'}
        className="fixed bottom-6 right-6 z-[9800] flex items-center gap-2 px-4 py-3 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200 print:hidden"
      >
        {isOpen
          ? <ChevronDown className="w-5 h-5" />
          : isLoading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <Sparkles className="w-5 h-5" />}
        <span className="text-sm font-semibold tracking-wide">ARIA</span>
        {streamingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            {streamingCount}
          </span>
        )}
        {logs.length > 0 && streamingCount === 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {logs.length > 9 ? '9+' : logs.length}
          </span>
        )}
      </button>

      {/* Painel flutuante */}
      <div
        role="dialog"
        aria-label="Assistente ARIA"
        className={`fixed bottom-20 right-6 z-[9800] w-80 sm:w-[26rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: '560px' }}
      >
        {/* Header */}
        <div className="bg-violet-600 text-white shrink-0">
          <div className="flex items-center justify-between px-4 pt-3 pb-0">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <div>
                <p className="text-sm font-bold leading-none">ARIA</p>
                <p className="text-[10px] text-violet-200 leading-none mt-0.5">
                  DeepSeek V4 Flash
                  {isLoading && <span className="ml-1 animate-pulse">· processando...</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLoading && (
                <button
                  onClick={handleCancel}
                  title="Cancelar processamento"
                  className="text-[10px] text-violet-200 hover:text-white border border-violet-400/40 hover:border-white/60 rounded-lg px-2 py-1 transition"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar painel"
                className="text-violet-200 hover:text-white transition p-1 rounded-lg hover:bg-violet-500/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex mt-2 px-4">
            {(['chat', 'logs'] as Panel[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActivePanel(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors capitalize ${
                  activePanel === tab
                    ? 'border-white text-white'
                    : 'border-transparent text-violet-300 hover:text-violet-100'
                }`}
              >
                {tab === 'chat' ? <Sparkles className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                {tab === 'chat' ? 'Chat' : 'Logs IA'}
                {tab === 'logs' && logs.length > 0 && (
                  <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                    {logs.length}
                    {streamingCount > 0 && <span className="ml-0.5 text-amber-300 animate-pulse">•</span>}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PAINEL CHAT */}
        {activePanel === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '380px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-violet-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <Clock className="w-2.5 h-2.5 text-slate-300" />
                    <span className="text-[9px] text-slate-400">{formatTime(msg.timestamp)}</span>
                    {msg.durationMs != null && !msg.streaming && (
                      <span className="text-[9px] text-slate-400">· {(msg.durationMs / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && !isLoading && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-slate-400 font-medium">Sugestoes:</p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva sua duvida..."
                disabled={isLoading}
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 dark:text-slate-200"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Enviar mensagem"
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* PAINEL LOGS */}
        {activePanel === 'logs' && (
          <>
            {logs.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
                <span className="text-xs text-slate-500">{logs.length} troca{logs.length > 1 ? 's' : ''} registrada{logs.length > 1 ? 's' : ''}</span>
                <button
                  onClick={() => setLogs([])}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '460px' }}>
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <Activity className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Nenhuma troca registrada ainda.</p>
                  <p className="text-xs text-slate-400 text-center px-6">Use o chat e as interacoes com a IA aparecerão aqui em tempo real.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 space-y-2 transition-colors ${
                        log.status === 'streaming'
                          ? 'bg-amber-50/60 dark:bg-amber-900/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.status === 'streaming' ? 'bg-amber-400 animate-pulse' :
                            log.status === 'ok' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`} />
                          <span className="text-[10px] text-slate-400 font-mono">{formatTime(log.timestamp)}</span>
                          {log.status === 'streaming' && (
                            <span className="text-[10px] text-amber-500 font-semibold animate-pulse">recebendo...</span>
                          )}
                        </div>
                        {log.status !== 'streaming' && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            log.status === 'ok'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}>
                            {(log.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex gap-2 items-start">
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 dark:bg-violet-900/20 rounded px-1.5 py-0.5 mt-0.5">IN</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">{log.input}</p>
                      </div>

                      <ArrowRight className="w-3 h-3 text-slate-300 ml-8" />

                      {/* Output */}
                      <div className="flex gap-2 items-start">
                        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 mt-0.5 ${
                          log.status === 'streaming' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                          : log.status === 'ok' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
                        }`}>
                          OUT
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                          {log.output || '...'}
                          {log.status === 'streaming' && (
                            <span className="inline-block w-1 h-3 bg-amber-400 rounded-sm ml-0.5 animate-pulse align-middle" />
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
