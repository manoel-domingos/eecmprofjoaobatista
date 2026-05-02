'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Loader2, Sparkles, ChevronDown, Activity, Clock, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  durationMs?: number;
}

interface LogEntry {
  id: number;
  input: string;
  output: string;
  durationMs: number;
  timestamp: Date;
  status: 'ok' | 'error';
}

type Panel = 'chat' | 'logs';

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
  const logId = useRef(0);

  useEffect(() => {
    if (isOpen && activePanel === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen && activePanel === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, logs, isOpen, activePanel]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmed = text.trim();
    const ts = new Date();
    setMessages(prev => [...prev, { role: 'user', content: trimmed, timestamp: ts }]);
    setInput('');
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', payload: { message: trimmed } }),
      });
      const data = await res.json();
      const durationMs = Date.now() - startTime;

      if (data.error) throw new Error(data.error);

      const reply = data.result as string;
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date(), durationMs }]);
      setLogs(prev => [...prev, {
        id: ++logId.current,
        input: trimmed,
        output: reply,
        durationMs,
        timestamp: ts,
        status: 'ok',
      }]);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errMsg = 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, timestamp: new Date(), durationMs }]);
      setLogs(prev => [...prev, {
        id: ++logId.current,
        input: trimmed,
        output: err?.message || errMsg,
        durationMs,
        timestamp: ts,
        status: 'error',
      }]);
    } finally {
      setIsLoading(false);
    }
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
    'Qual a diferença entre advertência oral e escrita?',
  ];

  return (
    <>
      {/* Botao flutuante FAB */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? 'Fechar ARIA' : 'Abrir assistente ARIA'}
        className="fixed bottom-6 right-6 z-[9800] flex items-center gap-2 px-4 py-3 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200 print:hidden"
      >
        {isOpen
          ? <ChevronDown className="w-5 h-5 transition-transform" />
          : <Sparkles className="w-5 h-5" />}
        <span className="text-sm font-semibold tracking-wide">ARIA</span>
        {logs.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {logs.length > 9 ? '9+' : logs.length}
          </span>
        )}
      </button>

      {/* Painel flutuante */}
      <div
        className={`fixed bottom-20 right-6 z-[9800] w-80 sm:w-[26rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: '540px' }}
      >
        {/* Header com abas */}
        <div className="bg-violet-600 text-white shrink-0">
          <div className="flex items-center justify-between px-4 pt-3 pb-0">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <div>
                <p className="text-sm font-bold leading-none">ARIA</p>
                <p className="text-[10px] text-violet-200 leading-none mt-0.5">DeepSeek V4 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fechar painel"
              className="text-violet-200 hover:text-white transition p-1 rounded-lg hover:bg-violet-500/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Abas */}
          <div className="flex mt-2 px-4">
            <button
              onClick={() => setActivePanel('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                activePanel === 'chat'
                  ? 'border-white text-white'
                  : 'border-transparent text-violet-300 hover:text-violet-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setActivePanel('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                activePanel === 'logs'
                  ? 'border-white text-white'
                  : 'border-transparent text-violet-300 hover:text-violet-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Logs IA
              {logs.length > 0 && (
                <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                  {logs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- PAINEL CHAT --- */}
        {activePanel === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '360px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <Clock className="w-2.5 h-2.5 text-slate-300" />
                    <span className="text-[9px] text-slate-400">{formatTime(msg.timestamp)}</span>
                    {msg.durationMs && (
                      <span className="text-[9px] text-slate-400">· {(msg.durationMs / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                    <span className="text-xs text-slate-500">DeepSeek processando...</span>
                  </div>
                </div>
              )}

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

        {/* --- PAINEL LOGS --- */}
        {activePanel === 'logs' && (
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '420px' }}>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                <Activity className="w-8 h-8 opacity-30" />
                <p className="text-sm">Nenhuma troca registrada ainda.</p>
                <p className="text-xs text-slate-400">As interacoes com a IA aparecerao aqui.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'ok' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className="text-[10px] text-slate-400 font-mono">{formatTime(log.timestamp)}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        log.status === 'ok'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {(log.durationMs / 1000).toFixed(1)}s
                      </span>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 items-start">
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 dark:bg-violet-900/20 rounded px-1.5 py-0.5 mt-0.5">
                        IN
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {log.input}
                      </p>
                    </div>

                    {/* Seta */}
                    <div className="flex items-center gap-1 pl-8">
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                    </div>

                    {/* Output */}
                    <div className="flex gap-2 items-start">
                      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 mt-0.5 ${
                        log.status === 'ok'
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
                      }`}>
                        OUT
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {log.output}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
