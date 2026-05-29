import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-sm' }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full ${maxWidth} border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};