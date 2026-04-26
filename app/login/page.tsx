'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Trophy, ShieldCheck, User as UserIcon, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import versionData from '@/lib/version.json';

export default function Login() {
  const router = useRouter();
  const { user, isGuest, setGuestMode, setMockUser, isSupabaseConnected } = useAppContext();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already logged in
  useEffect(() => {
    if (user || isGuest) {
      router.push('/');
    }
  }, [user, isGuest, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Hardcoded demo users
    const validUsers = ['gestor', 'maykon', 'manoel', 'djeovani', 'joana', 'edma', 'murillo', 'george', 'proença'];
    if (validUsers.includes(username.toLowerCase()) && password.toLowerCase() === username.toLowerCase()) {
      setMockUser(username.toLowerCase());
      router.push('/');
      return;
    }
    
    // Backwards compatibility for gestor123
    if (username === 'gestor' && password === 'gestor123') {
      setMockUser('gestor');
      router.push('/');
      return;
    }

    if (!supabase) {
      console.error("Supabase client is null. URL value:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      setError('A conexão com o banco de dados não está configurada corretamente.');
      setLoading(false);
      return;
    }

    try {
      const emailToUse = username.includes('@') ? username : `${username}@eecm.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        console.error("Login Supabase falhou:", error.message, error);
        setError(`Erro: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push('/');
      }
    } catch (err) {
      setError('Ocorreu um erro no servidor. Tente novamente.');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setGuestMode();
    router.push('/');
  };

  if (user || isGuest) return null; // Prevent flash during redirect

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden">
      
      {/* Background Decor */}
      <img src="/logo_login.svg" alt="" className="absolute -right-32 md:-right-24 top-[40%] md:top-[45%] -translate-y-1/2 w-[102vw] md:w-[60vw] max-w-[780px] opacity-15 pointer-events-none object-contain" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md p-6 sm:p-7 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl relative z-10 mx-4">
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative mb-3">
             <img src="/logo_login.svg" alt="Logo EECM" className="w-full h-full object-contain drop-shadow-xl" />
             
             <div className="fallback-container hidden flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
                  <Trophy className="text-white w-8 h-8" />
                </div>
             </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight text-center">EECM Prof. João Batista</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 text-center">Disciplina e Monitoramento Escolar</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: gestor"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Senha de Acesso</label>
              <a href="#" tabIndex={-1} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors outline-none cursor-pointer">Esqueceu a senha?</a>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-md shadow-blue-600/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar no Sistema <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-200/60 text-center">
          <button
            type="button"
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-3 mb-4 shadow-sm"
            onClick={async () => {
              if (!supabase) {
                setError('A conexão com o banco de dados não está configurada corretamente.');
                return;
              }
              try {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/`,
                  }
                });
                if (error) {
                  setError(`Erro Google Login: ${error.message}`);
                  setLoading(false);
                }
              } catch (err) {
                setError('Erro ao iniciar login com Google.');
                setLoading(false);
              }
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <button 
            onClick={handleGuestLogin}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            Acesso Somente Leitura
          </button>
          <p className="mt-6 text-[11px] text-slate-400 italic">
            Versão: {versionData.version}
          </p>
        </div>
      </div>
    </div>
  );
}
