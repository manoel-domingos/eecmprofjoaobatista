'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/store';
import {
  LayoutDashboard, Users, FileText, Activity,
  BarChart, AlertTriangle, Star, CheckSquare, FileBadge,
  UserPlus, Award, Menu, X, LogOut, ShieldAlert,
  Sun, Moon, RefreshCw, CloudCheck, CloudOff, MessageCircle, Settings,
  PanelsTopLeft, PanelLeft, ChevronDown, Terminal,
  GraduationCap, Gavel, Smile, Cog,
} from 'lucide-react';
import versionData from '@/lib/version.json';
import ChatWidget from '@/components/ChatWidget';
import AIAssistant from '@/components/AIAssistant';
import DebugAIPanel from '@/components/DebugAIPanel';

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

type LayoutMode = 'sidebar' | 'topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, currentUserRole, isAuthRestored, isDebugMode, setIsDebugMode, logout, isSyncing, isSupabaseConnected, refreshData } = useAppContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('topbar');

  useEffect(() => {
    if (isAuthRestored && !user && !isGuest) {
      router.push('/login');
    }
  }, [user, isGuest, isAuthRestored, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('layoutMode');
    if (stored === 'sidebar' || stored === 'topbar') {
      setLayoutMode(stored);
    }
  }, []);

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

  const toggleLayout = () => {
    const next: LayoutMode = layoutMode === 'sidebar' ? 'topbar' : 'sidebar';
    setLayoutMode(next);
    localStorage.setItem('layoutMode', next);
    setIsProfileOpen(false);
  };

  if (!user && !isGuest) return null;

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Gestor Escolar';
  const userInitials = userName.split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join('') || 'US';
  const userRole = isGuest ? 'Somente Leitura' : 'Admin';

  const rightControls = (
    <RightControls
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
      isDebugMode={isDebugMode}
      setIsDebugMode={setIsDebugMode}
      logout={logout}
      setIsChatOpen={setIsChatOpen}
      layoutMode={layoutMode}
      toggleLayout={toggleLayout}
    />
  );

  return (
    <div className={`min-h-screen bg-[#eef3f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 ${layoutMode === 'sidebar' ? 'flex' : 'flex flex-col'}`}>
      {/* Background decoration for liquid glass effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <MobileDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
      />

      {layoutMode === 'sidebar' ? (
        <SidebarLayout
          pathname={pathname}
          rightControls={rightControls}
          openMobileMenu={() => setIsMobileMenuOpen(true)}
        >
          {children}
        </SidebarLayout>
      ) : (
        <TopbarLayout
          pathname={pathname}
          rightControls={rightControls}
          openMobileMenu={() => setIsMobileMenuOpen(true)}
        >
          {children}
        </TopbarLayout>
      )}

      {isChatOpen && <ChatWidget forceOpen={true} forceOnClose={() => setIsChatOpen(false)} />}
      <AIAssistant />
      {isDebugMode && <DebugAIPanel />}
    </div>
  );
}

/* ---------- LAYOUT: SIDEBAR ---------- */

function SidebarLayout({
  pathname,
  rightControls,
  openMobileMenu,
  children,
}: {
  pathname: string;
  rightControls: React.ReactNode;
  openMobileMenu: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 flex-col shrink-0 shadow-2xl z-10">
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          <div className="w-28 h-28 flex items-center justify-center">
            <img src="/nova_logo.png" alt="Logo EECM" className="w-full h-full object-contain drop-shadow-md" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-4 px-3">
            {MENU_GROUPS.map((group) => {
              if (group.href) {
                const active = pathname === group.href;
                return (
                  <li key={group.label}>
                    <Link
                      href={group.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        active
                          ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <group.icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                      {group.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={group.label}>
                  <p className="px-4 mb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                    <group.icon className="w-3.5 h-3.5" />
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.children!.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 pl-8 pr-4 py-2 rounded-lg text-sm transition-colors ${
                              active
                                ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-500 italic text-center">
            Versão: {versionData.version}
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 md:hidden"
              onClick={openMobileMenu}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
              {findGroupForPath(pathname)?.itemLabel || 'Gestão'}
            </h2>
          </div>
          {rightControls}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </>
  );
}

/* ---------- LAYOUT: TOPBAR ---------- */

function TopbarLayout({
  pathname,
  rightControls,
  openMobileMenu,
  children,
}: {
  pathname: string;
  rightControls: React.ReactNode;
  openMobileMenu: () => void;
  children: React.ReactNode;
}) {
  const currentInfo = findGroupForPath(pathname);

  return (
    <>
      <header className="z-30 px-4 pt-2 pb-1 space-y-2 pointer-events-none">
        {/* top row: logo + right controls */}
        <div className="pointer-events-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 shadow-sm rounded-full flex items-center justify-between gap-4 px-4 md:px-6 py-1">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="p-1 -ml-1 text-slate-500 dark:text-slate-400 md:hidden"
              onClick={openMobileMenu}
            >
              <Menu className="w-6 h-6" />
            </button>
            <img
              src="/nova_logo.png"
              alt="EECM"
              className="w-16 h-16 md:w-[88px] md:h-[88px] object-contain shrink-0 drop-shadow-sm"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                <span className="font-extrabold">EECM</span>{' '}
                <span className="text-slate-500 dark:text-slate-400 font-normal">PROF. JOÃO BATISTA</span>
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                Disciplina e Monitoramento Escolar
              </p>
            </div>
          </div>
          {rightControls}
        </div>

        {/* nav row: grouped pills with hover dropdown */}
        <div className="pointer-events-auto hidden md:flex items-center justify-center gap-1 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/30 dark:border-slate-800/40 shadow-sm rounded-full px-4 md:px-10 py-1">
          {MENU_GROUPS.map((group) => (
            <GroupPill
              key={group.label}
              group={group}
              pathname={pathname}
              activeGroup={currentInfo?.groupLabel}
            />
          ))}
        </div>
      </header>

      <div className="md:hidden px-4 pt-3 pb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {currentInfo?.itemLabel || 'Gestão'}
      </div>

      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </>
  );
}

function GroupPill({
  group,
  pathname,
  activeGroup,
}: {
  group: MenuGroup;
  pathname: string;
  activeGroup: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const isActive = activeGroup === group.label;

  // Direct link group (no children)
  if (group.href) {
    const active = pathname === group.href;
    return (
      <Link
        href={group.href}
        className={`shrink-0 group/item flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500'
        }`}
      >
        <group.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover/item:text-white'}`} />
        <span className="whitespace-nowrap">{group.label}</span>
      </Link>
    );
  }

  // Group with children (dropdown on hover)
  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
          isActive || open
            ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500'
        }`}
      >
        <group.icon className={`w-4 h-4 transition-colors ${isActive || open ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        <span className="whitespace-nowrap">{group.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-40 min-w-[240px]">
          <div className="glass-card absolute z-50 w-full mt-2 max-h-60 flex flex-col py-1.5 overflow-hidden !rounded-3xl">
            {group.children!.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- MOBILE DRAWER (used by both layouts) ---------- */

function MobileDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E293B] flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out shadow-2xl md:hidden ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6 flex flex-col items-center border-b border-slate-800 relative">
        <button className="absolute top-4 right-4 text-slate-400" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <div className="w-24 h-24 flex items-center justify-center">
          <img src="/nova_logo.png" alt="Logo EECM" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-4 px-3">
          {MENU_GROUPS.map((group) => {
            if (group.href) {
              const active = pathname === group.href;
              return (
                <li key={group.label}>
                  <Link
                    href={group.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <group.icon className="w-5 h-5" />
                    {group.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={group.label}>
                <p className="px-4 mb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                  <group.icon className="w-3.5 h-3.5" />
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.children!.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 pl-8 pr-4 py-2 rounded-lg text-sm ${
                            active
                              ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-500 italic text-center">
          Versão: {versionData.version}
        </p>
      </div>
    </aside>
  );
}

/* ---------- RIGHT CONTROLS (used by both layouts) ---------- */

type RightControlsProps = {
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
  layoutMode: LayoutMode;
  toggleLayout: () => void;
  isDebugMode: boolean;
  setIsDebugMode: (v: boolean) => void;
};

function RightControls(props: RightControlsProps) {
  const {
    isSupabaseConnected, isSyncing, refreshData, isDarkMode, toggleTheme,
    isProfileOpen, setIsProfileOpen, user, userName, userInitials, userRole,
    currentUserRole, logout, setIsChatOpen, layoutMode, toggleLayout,
    isDebugMode, setIsDebugMode,
  } = props;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          isSupabaseConnected
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
            : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
        }`}
      >
        {isSupabaseConnected ? <CloudCheck className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
        <span>{isSupabaseConnected ? 'Online' : 'Offline'}</span>
      </div>

      <button
        onClick={refreshData}
        disabled={isSyncing}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition shadow-sm ${
          isSyncing ? 'animate-spin text-blue-500' : ''
        }`}
        title="Sincronizar"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition shadow-sm"
        title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>



      <div className="relative isolate z-50 ml-1">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition shadow-sm"
        >
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              {userInitials}
            </span>
          )}
          <div className="text-left hidden sm:block leading-tight pr-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{userName}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{userRole}</p>
          </div>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user?.email || 'Sem e-mail'}</p>
            </div>

            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-2">
                Aparência do menu
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={layoutMode !== 'topbar' ? toggleLayout : undefined}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition ${
                    layoutMode === 'topbar'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <PanelsTopLeft className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Horizontal</span>
                </button>
                <button
                  onClick={layoutMode !== 'sidebar' ? toggleLayout : undefined}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition ${
                    layoutMode === 'sidebar'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <PanelLeft className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Lateral</span>
                </button>
              </div>
            </div>

            <div className="py-2">
              {currentUserRole === 'GESTOR' && (
                <Link
                  href="/configuracoes"
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 flex items-center gap-3"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Configuração do Sistema
                </Link>
              )}
              <Link
                href="/status"
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-3"
                onClick={() => setIsProfileOpen(false)}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Status das Integrações
              </Link>
              <button
                onClick={() => { setIsChatOpen(true); setIsProfileOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-3"
              >
                <MessageCircle className="w-4 h-4 text-blue-500" /> Suporte
              </button>
              <button
                onClick={() => { setIsDebugMode(!isDebugMode); setIsProfileOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-3"
              >
                <Terminal className={`w-4 h-4 ${isDebugMode ? 'text-blue-500' : 'text-slate-400'}`} /> 
                {isDebugMode ? 'Desativar Depuração' : 'Ativar Depuração IA'}
              </button>
              <button
                onClick={() => { logout(); setIsProfileOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center">
                Versão: {versionData.version}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
