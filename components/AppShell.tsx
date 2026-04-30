'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/store';
import {
  LayoutDashboard, Users, FileText, Activity,
  BarChart, AlertTriangle, Star, CheckSquare, FileBadge,
  UserPlus, Award, LogOut, ShieldAlert,
  Sun, Moon, RefreshCw, CloudCheck, CloudOff, MessageCircle, Settings,
  ChevronDown, GraduationCap, Gavel, Smile, Cog, Clock, X,
} from 'lucide-react';
import versionData from '@/lib/version.json';
import ChatWidget from '@/components/ChatWidget';

type MenuItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type MenuGroup = { label: string; icon: React.ComponentType<{ className?: string }>; href?: string; children?: MenuItem[] };

const MENU_GROUPS: MenuGroup[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  {
    label: 'Alunos', icon: GraduationCap,
    children: [
      { href: '/alunos', label: 'Lista de Alunos', icon: Users },
      { href: '/ficha', label: 'Ficha Disciplinar', icon: FileBadge },
      { href: '/arquivados', label: 'Arquivados', icon: FileText },
    ],
  },
  {
    label: 'Disciplina', icon: Gavel,
    children: [
      { href: '/registro-disciplinar', label: 'Registro Disciplinar', icon: FileText },
      { href: '/faltas', label: 'Faltas Disciplinares', icon: CheckSquare },
      { href: '/termo', label: 'Termo de Conduta', icon: FileText },
      { href: '/convocacao', label: 'Convocação de Pais', icon: UserPlus },
    ],
  },
  {
    label: 'Comportamento', icon: Smile,
    children: [
      { href: '/comportamento', label: 'Comportamento & Rankings', icon: Activity },
      { href: '/elogios', label: 'Elogios e Bonificações', icon: Star },
      { href: '/acidentes', label: 'Registro de Acidentes', icon: AlertTriangle },
    ],
  },
  { label: 'Relatórios', icon: BarChart, href: '/relatorios' },
  {
    label: 'Sistema', icon: Cog,
    children: [
      { href: '/fechamento', label: 'Fechamento do Ano', icon: Award },
      { href: '/auditoria', label: 'Auditoria de Ações', icon: ShieldAlert },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/status', label: 'Status das Integrações', icon: ShieldAlert },
    ],
  },
];

// Bottom navigation tabs (4 main + "Mais")
const BOTTOM_TABS = [
  { label: 'Início', icon: LayoutDashboard, href: '/', group: null },
  { label: 'Alunos', icon: GraduationCap, href: null, group: 'Alunos' },
  { label: 'Disciplina', icon: Gavel, href: null, group: 'Disciplina' },
  { label: 'Comportamento', icon: Smile, href: null, group: 'Comportamento' },
  { label: 'Mais', icon: Cog, href: null, group: 'Sistema' },
];

function findGroupForPath(pathname: string): { groupLabel: string; itemLabel: string } | null {
  for (const g of MENU_GROUPS) {
    if (g.href && g.href === pathname) return { groupLabel: g.label, itemLabel: g.label };
    if (g.children) {
      const child = g.children.find((c) => c.href === pathname);
      if (child) return { groupLabel: g.label, itemLabel: child.label };
    }
  }
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, currentUserRole, isAuthRestored, logout, isSyncing, isSupabaseConnected, refreshData } = useAppContext();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string | null>(null); // group label for SubMenuSheet

  // Inactivity session management
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(10);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (showInactivityModal) return;
    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityModal(true);
      setInactivityCountdown(10);
    }, 10 * 60 * 1000);
  }, [showInactivityModal]);

  useEffect(() => {
    if (user && !isGuest) {
      resetInactivityTimer();
      const events = ['touchstart', 'touchmove', 'mousedown', 'keypress', 'scroll'];
      events.forEach(e => window.addEventListener(e, resetInactivityTimer));
      return () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      };
    }
  }, [user, isGuest, showInactivityModal, resetInactivityTimer]);

  useEffect(() => {
    if (showInactivityModal) {
      countdownTimerRef.current = setInterval(() => {
        setInactivityCountdown(prev => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            logout();
            setShowInactivityModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); };
    }
  }, [showInactivityModal, logout]);

  // Close sheet on navigation
  useEffect(() => { setActiveSheet(null); }, [pathname]);

  useEffect(() => {
    const initStorage = () => {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    };
    setTimeout(initStorage, 0);
  }, []);

  useEffect(() => {
    if (isAuthRestored && !user && !isGuest) {
      router.push('/login');
    }
  }, [user, isGuest, isAuthRestored, router]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  if (!user && !isGuest) return null;

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Gestor Escolar';
  const userInitials = userName.split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join('') || 'US';
  const userRole = isGuest ? 'Somente Leitura' : 'Admin';

  const currentInfo = findGroupForPath(pathname);
  const activeGroup = currentInfo?.groupLabel;

  const sheetGroup = activeSheet
    ? MENU_GROUPS.find(g => g.label === activeSheet)
    : null;

  return (
    <div className="min-h-screen bg-[#eef3f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full" />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        isSupabaseConnected={isSupabaseConnected}
        isSyncing={isSyncing}
        refreshData={refreshData}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        user={user}
        userName={userName}
        userInitials={userInitials}
        userRole={userRole}
        currentUserRole={currentUserRole}
        logout={logout}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Page title bar */}
      {currentInfo?.itemLabel && currentInfo.itemLabel !== 'Dashboard' && (
        <div className="relative z-10 px-4 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {currentInfo.groupLabel}
          </p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {currentInfo.itemLabel}
          </h1>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 pt-3 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        pathname={pathname}
        activeGroup={activeGroup}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
      />

      {/* SubMenu Sheet (slide-up) */}
      {sheetGroup && sheetGroup.children && (
        <SubMenuSheet
          group={sheetGroup}
          pathname={pathname}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {/* Sheet backdrop */}
      {activeSheet && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[900] animate-in fade-in duration-200"
          onClick={() => setActiveSheet(null)}
        />
      )}

      {isChatOpen && <ChatWidget forceOpen={true} forceOnClose={() => setIsChatOpen(false)} />}

      {/* Inactivity Modal */}
      {showInactivityModal && (
        <div className="fixed inset-0 glass-overlay z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass-modal w-full max-w-sm p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Sessão Expirando</h3>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                Você ficou inativo por muito tempo. Sua sessão será encerrada em:
              </p>
            </div>
            <div className="text-6xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {inactivityCountdown}
            </div>
            <button
              onClick={() => { setShowInactivityModal(false); resetInactivityTimer(); }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold transition text-lg min-h-[56px]"
            >
              Continuar Conectado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- MOBILE HEADER ---------- */

type MobileHeaderProps = {
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  refreshData: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (v: boolean) => void;
  user: { email?: string; user_metadata?: { full_name?: string; name?: string; avatar_url?: string } } | null;
  userName: string;
  userInitials: string;
  userRole: string;
  currentUserRole: string | null;
  logout: () => void;
  setIsChatOpen: (v: boolean) => void;
};

function MobileHeader({
  isSupabaseConnected, isSyncing, refreshData, isDarkMode, toggleTheme,
  isProfileOpen, setIsProfileOpen, user, userName, userInitials, userRole,
  currentUserRole, logout, setIsChatOpen,
}: MobileHeaderProps) {
  return (
    <header className="relative z-30 px-4 pt-safe pt-3 pb-2">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-sm rounded-2xl flex items-center justify-between gap-2 px-3 py-2">
        {/* Logo */}
        <img
          src="/logo_dash.svg"
          alt="EECM"
          className="h-10 w-auto object-contain shrink-0 drop-shadow-sm"
        />

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
            }`}
          >
            {isSupabaseConnected ? <CloudCheck className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
            {isSupabaseConnected ? 'Online' : 'Offline'}
          </span>

          {/* Sync */}
          <button
            onClick={refreshData}
            disabled={isSyncing}
            aria-label="Sincronizar"
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-700/60 active:scale-95 transition ${isSyncing ? 'animate-spin text-blue-500' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-700/60 active:scale-95 transition"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile */}
          <ProfileMenu
            isOpen={isProfileOpen}
            setIsOpen={setIsProfileOpen}
            user={user}
            userName={userName}
            userInitials={userInitials}
            userRole={userRole}
            currentUserRole={currentUserRole}
            logout={logout}
            setIsChatOpen={setIsChatOpen}
          />
        </div>
      </div>
    </header>
  );
}

/* ---------- BOTTOM NAVIGATION ---------- */

function BottomNav({
  pathname,
  activeGroup,
  activeSheet,
  setActiveSheet,
}: {
  pathname: string;
  activeGroup: string | undefined;
  activeSheet: string | null;
  setActiveSheet: (g: string | null) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[950] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around">
        {BOTTOM_TABS.map((tab) => {
          const isDirectLink = !!tab.href;
          const isActive = isDirectLink
            ? pathname === tab.href
            : (activeGroup === tab.group || activeSheet === tab.group);

          if (isDirectLink) {
            return (
              <Link
                key={tab.label}
                href={tab.href!}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[60px] transition-colors active:scale-95 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <tab.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[11px] font-semibold leading-none">{tab.label}</span>
                {isActive && <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </Link>
            );
          }

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveSheet(activeSheet === tab.group ? null : tab.group!)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[60px] transition-colors active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <tab.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] font-semibold leading-none">{tab.label}</span>
              {isActive && <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- SUBMENU SHEET (slide-up from bottom) ---------- */

function SubMenuSheet({
  group,
  pathname,
  onClose,
}: {
  group: MenuGroup;
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[960] animate-in slide-in-from-bottom duration-300">
      <div
        className="glass-modal rounded-b-none rounded-t-3xl overflow-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <group.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{group.label}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <ul className="py-2 px-3">
          {group.children!.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl mb-1 min-h-[56px] transition-colors active:scale-[0.98] ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="text-base font-medium">{item.label}</span>
                  {active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- PROFILE MENU (Portal) ---------- */

type ProfileMenuProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  user: { email?: string; user_metadata?: { full_name?: string; name?: string; avatar_url?: string } } | null;
  userName: string;
  userInitials: string;
  userRole: string;
  currentUserRole: string | null;
  logout: () => void;
  setIsChatOpen: (v: boolean) => void;
};

function ProfileMenu({
  isOpen, setIsOpen, user, userName, userInitials, userRole,
  currentUserRole, logout, setIsChatOpen,
}: ProfileMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    }
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setIsOpen(false); }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu do perfil"
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 active:scale-95 transition min-h-[44px]"
      >
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            {userInitials}
          </span>
        )}
        <div className="text-left leading-tight pr-1">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{userName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{userRole}</p>
        </div>
      </button>

      {mounted && isOpen && pos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="fixed w-72 glass-dropdown overflow-hidden text-sm animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: pos.top, right: pos.right, zIndex: 99999 }}
        >
          {/* User info */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-base">{userName}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{user?.email || 'Sem e-mail'}</p>
          </div>

          {/* Actions */}
          <div className="py-2">
            {currentUserRole === 'GESTOR' && (
              <Link
                href="/configuracoes"
                className="w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 flex items-center gap-3 min-h-[52px] text-base"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5 shrink-0" /> Configuração do Sistema
              </Link>
            )}
            <Link
              href="/status"
              className="w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-3 min-h-[52px] text-base"
              onClick={() => setIsOpen(false)}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" /> Status das Integrações
            </Link>
            <button
              onClick={() => { setIsChatOpen(true); setIsOpen(false); }}
              className="w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-3 min-h-[52px] text-base"
            >
              <MessageCircle className="w-5 h-5 shrink-0 text-blue-500" /> Suporte
            </button>
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 flex items-center gap-3 min-h-[52px] text-base"
            >
              <LogOut className="w-5 h-5 shrink-0" /> Sair
            </button>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center">
              Versão: {versionData.version}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
