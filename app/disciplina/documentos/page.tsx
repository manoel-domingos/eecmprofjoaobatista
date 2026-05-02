'use client';

import AppShell from '@/components/AppShell';
import { FolderOpen, ExternalLink, Upload, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const DRIVE_FOLDER_ID = '1_aj5b9ukcApeUzSs2dFgIdgHclW4uYbk';
const DRIVE_EMBED_URL = `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#list`;
const DRIVE_OPEN_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

export default function DocumentosPage() {
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Documentos</h1>
              <p className="text-xs text-muted-foreground">Repositório disciplinar — Google Drive</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Recarregar iframe */}
            <button
              onClick={() => { setIframeKey(k => k + 1); setLoading(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-foreground text-xs font-medium transition-colors"
              title="Recarregar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recarregar
            </button>

            {/* Upload — abre pasta no Drive */}
            <a
              href={DRIVE_OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Enviar arquivo
            </a>

            {/* Abrir no Drive */}
            <a
              href={DRIVE_OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-foreground text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir no Drive
            </a>
          </div>
        </div>

        {/* Aviso de permissão */}
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 flex items-center gap-2">
          <span className="font-semibold">Dica:</span>
          Para fazer upload de novos arquivos, clique em &quot;Enviar arquivo&quot; ou acesse diretamente pelo botão &quot;Abrir no Drive&quot;. Certifique-se de estar logado com a conta Google autorizada.
        </div>

        {/* Iframe do Google Drive */}
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Carregando pasta do Drive...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            src={DRIVE_EMBED_URL}
            title="Pasta de Documentos — Google Drive"
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 130px)' }}
            onLoad={() => setLoading(false)}
            allow="autoplay"
          />
        </div>
      </div>
    </AppShell>
  );
}
