'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ToastMessage, ToastType } from '@/lib/types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        transform transition-all duration-200
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
        ${bgMap[toast.type]}
      `}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {iconMap[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export default Toast;
