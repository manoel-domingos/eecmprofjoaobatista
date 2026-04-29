'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import type { ToastType } from '@/lib/types';

interface ToastContextType {
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const {
    toasts,
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
    clearAllToasts,
  } = useToast();

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        warning,
        info,
        addToast,
        removeToast,
        clearAllToasts,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
