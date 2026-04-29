import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppProvider } from '@/lib/store';
import { ToastProvider } from '@/components/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Gestão Disciplinar EECM',
  description: 'Sistema de Gestão Disciplinar da Escola Estadual Cívico-Militar',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="bg-background" suppressHydrationWarning>
      <body className="bg-[#F8FAFC] text-slate-800 min-h-screen" suppressHydrationWarning>
        <AppProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
