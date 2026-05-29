import React from 'react';
import { useStore } from '../store/useStore';
import { MousePointer2, Hand, ZoomIn, Minus, Plus } from 'lucide-react';

export const BottomToolbar: React.FC = () => {
  const { tool, setTool, zoom, setZoom, pan, setPan } = useStore();

  const btnClass = (isActive: boolean) => 
    `p-2.5 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`;

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(zoom + delta, 3));
    if (newZoom === zoom) return;
    
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl) {
      setZoom(newZoom);
      return;
    }
    
    const bounds = canvasEl.getBoundingClientRect();
    const screenCenterX = bounds.width / 2;
    const screenCenterY = bounds.height / 2;
    
    const localX = (screenCenterX - pan.x) / zoom;
    const localY = (screenCenterY - pan.y) / zoom;
    
    setZoom(newZoom);
    setPan({ x: screenCenterX - localX * newZoom, y: screenCenterY - localY * newZoom });
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-slate-800/70 backdrop-blur p-1.5 rounded-xl shadow-xl shadow-slate-900/5 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 z-[90]">
      <button 
        onClick={() => setTool('selection')}
        className={btnClass(tool === 'selection')}
        title="Selection (V)"
      >
        <MousePointer2 size={20} />
      </button>
      <button 
        onClick={() => setTool('hand')}
        className={btnClass(tool === 'hand')}
        title="Hand / Pan (H)"
      >
        <Hand size={20} />
      </button>
      <button 
        onClick={() => setTool('zoom')}
        className={btnClass(tool === 'zoom')}
        title="Zoom (Z) - Click to zoom in, Alt+Click to zoom out"
      >
        <ZoomIn size={20} />
      </button>

      <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <button 
        onClick={() => handleZoom(-0.1)}
        className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
        title="Zoom Out"
      >
        <Minus size={18} />
      </button>
      <div 
        className="px-1 text-xs font-bold text-slate-500 dark:text-slate-400 w-[50px] text-center select-none cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        title="Reset Zoom to 100%"
        onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }}
      >
        {Math.round(zoom * 100)}%
      </div>
      <button 
        onClick={() => handleZoom(0.1)}
        className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
        title="Zoom In"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};