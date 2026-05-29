import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Copy, ClipboardPaste, CopyPlus, Trash2, ArrowRight, Plus, Minus, ArrowLeftRight, ChevronRight, Palette, Type as TypeIcon, GripHorizontal, Combine, Unlink } from 'lucide-react';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu, copySelected, duplicateSelected, pasteFromClipboard, deleteSelected, deleteArrow, updateArrow, updateClass, clipboard, zoom, pan, arrows, selectedIds, classes, setEditingPolygonId, groupSelected, ungroupSelected, removeFromGroup, deletePolygonVertex, addPolygonVertexToEdge, commitHistory } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu) return null;
  const { type, x, y, targetId, subTarget, clickPos } = contextMenu;

  const handleAction = (action: () => void, keepOpen: boolean = false) => {
    action();
    commitHistory();
    if (!keepOpen) closeContextMenu(); // بعد از هر عملیات منو بسته شود (مگر اینکه خواسته باشیم باز بماند)
  };

  const btnClass = "w-full text-left px-4 py-1 text-[13px] font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors";
  const isMulti = selectedIds.length > 1;

  const cls = targetId && type === 'class' ? classes.find(c => c.id === targetId) : null;
  const isComment = cls?.type === 'comment';
  const isPolygon = cls?.type === 'polygon';

  const selectedGroupIds = new Set<string>();
  let hasUngroupedItems = false;
  selectedIds.forEach(id => {
      const c = classes.find(x => x.id === id);
      const a = arrows.find(x => x.id === id);
      const groupId = c?.groupId || a?.groupId;
      if (groupId) {
          selectedGroupIds.add(groupId);
      } else {
          hasUngroupedItems = true;
      }
  });

  let isFullGroupSelected = true;
  if (selectedGroupIds.size > 0) {
      selectedGroupIds.forEach(groupId => {
          const itemsInGroup = [
              ...classes.filter(c => c.groupId === groupId).map(c => c.id),
              ...arrows.filter(a => a.groupId === groupId).map(a => a.id)
          ];
          const allSelected = itemsInGroup.every(id => selectedIds.includes(id));
          if (!allSelected) isFullGroupSelected = false;
      });
  } else {
      isFullGroupSelected = false;
  }

  const isAllSameGroup = selectedGroupIds.size === 1 && !hasUngroupedItems && selectedIds.length > 0;
  const showUngroup = isAllSameGroup && isFullGroupSelected;
  const showRemoveFromGroup = selectedGroupIds.size === 1 && !showUngroup && !hasUngroupedItems;
  const showGroup = isMulti && !isAllSameGroup;

  const renderGroupActions = () => {
    if (!showGroup && !showUngroup && !showRemoveFromGroup) return null;
    return (
      <>
        {showGroup && <button className={btnClass} onClick={() => handleAction(() => groupSelected())}><Combine size={14} /> Group Selected <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+G</span></button>}
        {showUngroup && <button className={btnClass} onClick={() => handleAction(() => ungroupSelected())}><Unlink size={14} /> Ungroup <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+G</span></button>}
        {showRemoveFromGroup && <button className={btnClass} onClick={() => handleAction(() => removeFromGroup())}><Unlink size={14} /> Remove from Group</button>}
        <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
      </>
    );
  };

  return (
    <div 
      ref={menuRef}
      className="absolute z-[1000] min-w-[170px] bg-white dark:bg-slate-800 rounded-lg shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 py-1.5"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()} // جلوگیری از باز شدن منوی دیفالت مرورگر روی خود این منو
    >
      {type === 'class' && targetId && (
        <>
          {isMulti && <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{selectedIds.length} Items Selected</div>}
          {renderGroupActions()}
          
          {isPolygon && (
            <>
              <button className={btnClass} onClick={() => handleAction(() => setEditingPolygonId(targetId))}>
                <GripHorizontal size={14} className="text-slate-400" /> <span className="capitalize">Edit Points</span>
              </button>
              <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
            </>
          )}

          <button className={btnClass} onClick={() => handleAction(() => copySelected())}><Copy size={14} /> Copy {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+C</span></button>
          <button className={btnClass} onClick={() => handleAction(() => duplicateSelected())}><CopyPlus size={14} /> Duplicate {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+D</span></button>
          <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
          <button className={`${btnClass} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`} onClick={() => handleAction(() => deleteSelected())}><Trash2 size={14} /> Delete {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-red-400/70 tracking-widest">Del</span></button>
        </>
      )}

      {type === 'arrow' && targetId && (
        <>
          {isMulti && <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{selectedIds.length} Items Selected</div>}
          {renderGroupActions()}
          
          {(() => {
              const arrow = arrows.find(a => a.id === targetId);
              if (!arrow) return null;
              const cps = arrow.controlPoints || [];
              return (
                  <>
                    {cps.length < 4 && (
                        <button className={btnClass} onClick={() => handleAction(() => {
                            const localX = (x - pan.x) / zoom;
                            const localY = (y - pan.y) / zoom;
                            const segIdx = contextMenu.subTarget !== undefined ? parseInt(contextMenu.subTarget, 10) : cps.length;
                            const newCps = [...cps];
                            newCps.splice(segIdx, 0, { x: localX, y: localY });
                            updateArrow(targetId, { controlPoints: newCps });
                        })}>
                          <Plus size={14} className="text-slate-400" /> <span className="capitalize">Add Anchor</span>
                        </button>
                    )}
                    {(cps.length < 4 || cps.length > 0) && (
                        <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
                    )}
                  </>
              )
          })()}

          <button className={btnClass} onClick={() => handleAction(() => copySelected())}><Copy size={14} /> Copy {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+C</span></button>
          <button className={btnClass} onClick={() => handleAction(() => duplicateSelected())}><CopyPlus size={14} /> Duplicate {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+D</span></button>
          <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
          <button className={`${btnClass} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`} onClick={() => handleAction(() => deleteSelected())}><Trash2 size={14} /> Delete {isMulti ? 'Selected' : ''} <span className="ml-auto text-[10px] text-red-400/70 tracking-widest">Del</span></button>
        </>
      )}

      {type === 'anchor' && targetId && (
        <button className={btnClass} onClick={() => handleAction(() => {
            const arrow = arrows.find(a => a.id === targetId);
            if (arrow && contextMenu.subTarget !== undefined) {
                const idx = parseInt(contextMenu.subTarget, 10);
                const newCps = [...(arrow.controlPoints || [])];
                newCps.splice(idx, 1);
                updateArrow(targetId, { controlPoints: newCps });
            }
        })}>
          <Trash2 size={14} className="text-red-500" /> <span className="text-red-500 capitalize">Delete Anchor</span>
        </button>
      )}

      {type === 'polygon-vertex' && targetId && subTarget !== undefined && (
        <button className={btnClass} onClick={() => handleAction(() => {
            deletePolygonVertex(targetId, parseInt(subTarget, 10));
        })}>
          <Trash2 size={14} className="text-red-500" /> <span className="text-red-500 capitalize">Delete Vertex</span>
        </button>
      )}

      {type === 'polygon-edge' && targetId && clickPos && (
        <button className={btnClass} onClick={() => handleAction(() => {
            addPolygonVertexToEdge(targetId, clickPos.x, clickPos.y);
        })}>
          <Plus size={14} className="text-slate-400" /> <span className="capitalize">Add Vertex Here</span>
        </button>
      )}

      {type === 'canvas' && (
        <button 
          className={`${btnClass} ${!clipboard ? 'opacity-50 cursor-not-allowed' : ''}`} 
          disabled={!clipboard}
          onClick={() => {
            if (clipboard) handleAction(() => pasteFromClipboard((x - pan.x) / zoom, (y - pan.y) / zoom));
          }}
        >
          <ClipboardPaste size={14} /> Paste <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 tracking-widest">Ctrl+V</span>
        </button>
      )}
    </div>
  );
};