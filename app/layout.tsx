import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Gestão Disciplinar EECM',
  description: 'Sistema de Gestão Disciplinar da Escola Estadual Cívico-Militar',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[#F8FAFC] text-slate-800 min-h-screen" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
