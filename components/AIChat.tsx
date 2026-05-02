'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Loader2, ChevronDown, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a ARIA, assistente virtual da E.E. Cívico-Militar Prof. João Batista. Como posso ajudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', payload: { message: text.trim() } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
    } catch (err: any) {
      console.error('[v0] AIChat error:', err?.message || err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'O que é o Art. 4 do regimento?',
    'Como registrar uma ocorrência?',
    'Qual a diferença entre advertência oral e escrita?',
  ];

  return (
    <>
      {/* Botao flutuante */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-[9800] flex items-center gap-2 px-4 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-300 transition-all duration-200 print:hidden"
        aria-label="Abrir assistente ARIA"
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        <span className="text-sm font-semibold">ARIA</span>
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-[9800] w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden"
          style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-violet-600 text-white">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <div>
                <p className="text-sm font-bold leading-none">ARIA</p>
                <p className="text-xs text-violet-200 leading-none mt-0.5">Assistente IA — DeepSeek</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-violet-200 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '340px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                </div>
              </div>
            )}

            {/* Sugestoes (apenas no inicio) */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-slate-400 font-medium">Sugestões:</p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua dúvida..."
              disabled={isLoading}
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
