'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
    confirm: <AlertTriangle className="w-6 h-6 text-amber-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-100 border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            title="Cerrar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 bg-slate-50 border-t border-slate-200">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-800/20"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
