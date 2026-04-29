'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  requireTextConfirmation?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  requireTextConfirmation,
}: ConfirmDialogProps) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = requireTextConfirmation 
    ? inputText.toLowerCase() !== requireTextConfirmation.toLowerCase()
    : false;

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm();
      setInputText('');
    }
  };

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    default: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-5">
          <div className={`p-3 rounded-full shrink-0 ${styles.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
            
            {requireTextConfirmation && (
              <div className="mt-4">
                <p className="text-sm text-slate-500 mb-2">
                  Digite <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{requireTextConfirmation}</span> para confirmar:
                </p>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={requireTextConfirmation}
                  autoFocus
                />
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
