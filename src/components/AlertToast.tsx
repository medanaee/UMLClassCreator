import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const AlertToast: React.FC = () => {
  const { alert, hideAlert } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(hideAlert, 300); // 300ms delay to allow fade out animation
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  if (!alert && !visible) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500 shrink-0" size={18} />,
    error: <AlertTriangle className="text-red-500 shrink-0" size={18} />,
    info: <Info className="text-blue-500 shrink-0" size={18} />
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
    error: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',
    info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[280px] max-w-[90vw] transform-gpu transition-all duration-300 ease-out font-sans ${bgColors[alert?.type || 'info']} ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        {icons[alert?.type || 'info']}
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex-1 pr-4">{alert?.message}</p>
        <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 shrink-0 bg-white/50 dark:bg-slate-900/50 rounded-md">
          <X size={14} />
        </button>
    </div>
  );
};