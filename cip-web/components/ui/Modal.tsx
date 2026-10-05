'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full overflow-hidden">
        {title && (
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        )}

        <div className="px-6 py-6 space-y-4">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
