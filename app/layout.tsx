import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Gestão Disciplinar EECM',
  description: 'Sistema de Gestão Disciplinar da Escola Estadual Cívico-Militar',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EECM Gestão',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef3f9' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-[#eef3f9] dark:bg-slate-950" suppressHydrationWarning>
      <body className="bg-[#eef3f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
