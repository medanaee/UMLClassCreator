import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getClassAnchors, getAttachedPos } from '../store/utils';
import type { Point, SnapLine } from '../store/types';
import { UmlClass } from './UmlClass';
import { SvgLayer } from './SvgLayer';
import { ContextMenu } from './ContextMenu';
import { Move } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { classes, arrows, selectElement, onDrag, endDrag, dragState, showAnchors, snapLines, openContextMenu, isLeftPanelOpen, isRightPanelOpen, tool, zoom, pan, setPan, setZoom, selectionBox, selectedIds, startDrag, pendingArrowType, setPendingArrowType, startDrawingArrow, isDrawingPolygon, pendingPolygonVertices, addPolygonVertex, finishDrawingPolygon, editingPolygonId, setEditingPolygonId, settings, pendingItemType, setPendingItemType, pendingImageData, setPendingImageData, addClass, addTextBox, addComment, addImage, pendingShapeType, setPendingShapeType, addShape } = useStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const [altPressed, setAltPressed] = useState(false);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [polygonSnapLines, setPolygonSnapLines] = useState<SnapLine[]>([]);

  // Handle global mouse moves
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning.current) {
        setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
        return;
      }

      if (!canvasRef.current) return;
      const bounds = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - bounds.left - pan.x) / zoom;
      const mouseY = (e.clientY - bounds.top - pan.y) / zoom;

      if (isDrawingPolygon) {
        const startVertex = pendingPolygonVertices[0];
        let snappedX = mouseX;
        let snappedY = mouseY;
        const activeSnapLines: SnapLine[] = [];

        if (startVertex && Math.hypot(startVertex.x - mouseX, startVertex.y - mouseY) < 15 / zoom) {
          snappedX = startVertex.x;
          snappedY = startVertex.y;
        } else {
          const SNAP_DIST = 5 / zoom;
          const linesX: number[] = [];
          const linesY: number[] = [];

          for (const v of pendingPolygonVertices) {
            linesX.push(v.x);
            linesY.push(v.y);
          }

          classes.forEach(c => {
            linesX.push(c.x, c.x + c.width / 2, c.x + c.width);
            const h = c.height || (38 + 20 + 30 + (c.items.length * 30));
            linesY.push(c.y, c.y + h / 2, c.y + h);
          });

          for (const lx of linesX) {
            if (Math.abs(lx - mouseX) < SNAP_DIST) {
              snappedX = lx;
              activeSnapLines.push({ type: 'vertical', position: lx });
              break;
            }
          }
          for (const ly of linesY) {
            if (Math.abs(ly - mouseY) < SNAP_DIST) {
              snappedY = ly;
              activeSnapLines.push({ type: 'horizontal', position: ly });
              break;
            }
          }
        }
        setMousePos({ x: snappedX, y: snappedY });
        setPolygonSnapLines(activeSnapLines);
        return;
      }

      if (!dragState.targetId) return;
      
      
      // Calculate delta for things that use it
      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;

      onDrag(mouseX, mouseY, deltaX, deltaY, bounds, e.shiftKey);
    };

    const handleMouseUp = () => {
      isPanning.current = false;
      if (dragState.targetId) {
        endDrag();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onDrag, endDrag, pan.x, pan.y, zoom, setPan, isDrawingPolygon, pendingPolygonVertices, classes]);

  // Handle Alt key for zoom out cursor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltPressed(false);
    };
    const handleBlur = () => setAltPressed(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur); // برای جلوگیری از گیر کردن حالت موس هنگام تغییر تب
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Handle Escape key to cancel arrow drawing
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingArrowType) setPendingArrowType(null);
        if (editingPolygonId) setEditingPolygonId(null);
        if (pendingItemType) {
          setPendingItemType(null);
          setPendingImageData(null);
          setPendingShapeType(null);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [pendingArrowType, setPendingArrowType, editingPolygonId, setEditingPolygonId, pendingItemType, setPendingItemType, setPendingImageData]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const state = useStore.getState();
      if (e.ctrlKey || e.metaKey || state.tool === 'zoom') {
        e.preventDefault();
        const bounds = canvasEl.getBoundingClientRect();
        const screenX = e.clientX - bounds.left;
        const screenY = e.clientY - bounds.top;
        const localX = (screenX - state.pan.x) / state.zoom;
        const localY = (screenY - state.pan.y) / state.zoom;
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(state.zoom + zoomDelta, 3));
        state.setZoom(newZoom);
        state.setPan({ x: screenX - localX * newZoom, y: screenY - localY * newZoom });
      } else {
        let dx = e.deltaX;
        let dy = e.deltaY;
        if (e.shiftKey && dx === 0) {
          dx = dy;
          dy = 0;
        }
        state.setPan({ x: state.pan.x - dx, y: state.pan.y - dy });
      }
    };

    canvasEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvasEl.removeEventListener('wheel', handleNativeWheel);
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    if (isDrawingPolygon) {
      const bounds = canvasRef.current!.getBoundingClientRect();
      const screenX = e.clientX - bounds.left;
      const screenY = e.clientY - bounds.top;
      const localX = (screenX - pan.x) / zoom;
      const localY = (screenY - pan.y) / zoom;

      const startVertex = pendingPolygonVertices[0];
      const finalX = mousePos ? mousePos.x : localX;
      const finalY = mousePos ? mousePos.y : localY;
      // اگر فاصله با نقطه اول کمتر از 15 پیکسل باشد (با توجه به زوم)، شکل بسته می‌شود
      if (startVertex && Math.hypot(startVertex.x - finalX, startVertex.y - finalY) < 15 / zoom) {
        finishDrawingPolygon();
        setPolygonSnapLines([]);
      } else {
        addPolygonVertex(finalX, finalY);
      }
      return;
    }

    if (tool === 'hand') {
      isPanning.current = true;
      return;
    }
    if (tool === 'zoom') {
      const bounds = canvasRef.current!.getBoundingClientRect();
      const screenX = e.clientX - bounds.left;
      const screenY = e.clientY - bounds.top;
      const localX = (screenX - pan.x) / zoom;
      const localY = (screenY - pan.y) / zoom;
      const zoomDelta = e.altKey ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(zoom + zoomDelta, 3));
      setZoom(newZoom);
      setPan({ x: screenX - localX * newZoom, y: screenY - localY * newZoom });
      return;
    }
    const targetId = (e.target as HTMLElement).id;
    if (e.target === canvasRef.current || targetId === 'canvas-content' || targetId === 'svg-layer' || targetId === 'tool-overlay') {
      if (!e.ctrlKey && !e.metaKey) {
        selectElement(null);
        if (editingPolygonId) setEditingPolygonId(null);
      }
      
      if (tool === 'selection') {
          const bounds = canvasRef.current!.getBoundingClientRect();
          const screenX = e.clientX - bounds.left;
          const screenY = e.clientY - bounds.top;
          const localX = (screenX - pan.x) / zoom;
          const localY = (screenY - pan.y) / zoom;
          
          startDrag({
            targetId: 'selection-box',
            type: 'selection-box',
            startX: localX,
            startY: localY,
            initialPositions: (e.ctrlKey || e.metaKey) ? selectedIds.reduce((acc, id) => ({...acc, [id]: {}}), {}) : {}
          });
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = (e.target as HTMLElement).id;
    if (e.target === canvasRef.current || targetId === 'canvas-content' || targetId === 'svg-layer' || targetId === 'tool-overlay') {
      const bounds = canvasRef.current!.getBoundingClientRect();
      const screenX = e.clientX - bounds.left;
      const screenY = e.clientY - bounds.top;

      // اگر بیشتر از یک المان انتخاب شده باشد، بررسی می‌کنیم که آیا کلیک راست روی کادر آبی بوده است یا نه
      if (selectedIds.length > 1) {
        const localX = (screenX - pan.x) / zoom;
        const localY = (screenY - pan.y) / zoom;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        classes.forEach(c => {
          if (selectedIds.includes(c.id)) {
            minX = Math.min(minX, c.x);
            minY = Math.min(minY, c.y);
            maxX = Math.max(maxX, c.x + c.width);
            maxY = Math.max(maxY, c.y + (c.height || 100));
          }
        });
        arrows.forEach(a => {
          if (selectedIds.includes(a.id)) {
            const startPt = getAttachedPos(classes, a.start.attachedTo, a.start.anchorIndex, a.start);
            const endPt = getAttachedPos(classes, a.end.attachedTo, a.end.anchorIndex, a.end);
            const pts = [startPt, ...(a.controlPoints || []), endPt];
            pts.forEach(p => {
               minX = Math.min(minX, p.x);
               minY = Math.min(minY, p.y);
               maxX = Math.max(maxX, p.x);
               maxY = Math.max(maxY, p.y);
            });
          }
        });

        // اعمال حاشیه ۱۵ پیکسلی برای پوشش دادن کاملِ کادر گروهی
        if (minX !== Infinity && localX >= minX - 15 && localX <= maxX + 15 && localY >= minY - 15 && localY <= maxY + 15) {
          const firstTarget = classes.find(c => selectedIds.includes(c.id))?.id || arrows.find(a => selectedIds.includes(a.id))?.id;
          if (firstTarget) {
            openContextMenu({
              type: firstTarget.startsWith('arrow-') ? 'arrow' : 'class',
              x: screenX,
              y: screenY,
              targetId: firstTarget
            });
            return;
          }
        }
      }

      openContextMenu({
        type: 'canvas',
        x: screenX,
        y: screenY,
        targetId: null
      });
    }
  };

  let cursorClass = '';
  if (tool === 'hand') cursorClass = 'cursor-grab active:cursor-grabbing';
  if (tool === 'zoom') cursorClass = altPressed ? 'cursor-zoom-out' : 'cursor-zoom-in';

  let gridBgClass = '';
  if (settings.gridType === 'dot' || !settings.gridType) {
    gridBgClass = 'bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#334155_1px,transparent_1px)]';
  } else if (settings.gridType === 'grid') {
    gridBgClass = 'bg-[linear-gradient(to_right,#cbd5e1a0_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1a0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155a0_1px,transparent_1px),linear-gradient(to_bottom,#334155a0_1px,transparent_1px)]';
  }

  return (
    <div 
      id="canvas"
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={handleContextMenu}
      className={`absolute top-[65px] bottom-0 overflow-hidden ${cursorClass} ${gridBgClass} transition-[left,right] duration-300 ${isLeftPanelOpen ? 'left-64' : 'left-0'} ${isRightPanelOpen ? 'right-64' : 'right-0'}`}
      style={{
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        fontFamily: settings.fontFamily
      }}
    >
      <div 
        id="canvas-content"
        className={`absolute top-0 left-0 w-full h-full origin-top-left ${tool !== 'selection' ? 'pointer-events-none' : ''}`}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <SvgLayer />
        
        {classes.map(cls => (
          <UmlClass key={cls.id} cls={cls} />
        ))}
        
        {/* Anchor snappers rendering */}
        {(showAnchors || pendingArrowType) && classes.map(cls => {
          const estimatedHeight = 38 + 20 + 30 + (cls.items.length * 30);
          const points = getClassAnchors(cls, cls.height || estimatedHeight);
          return points.map((pt, idx) => (
            <div 
              key={`${cls.id}-anchor-${idx}`} 
              className="absolute w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full z-[60] shadow-sm pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: pt.x, top: pt.y }}
            />
          ));
        })}

        {/* Snapping Guidelines */}
        {snapLines.map((line, idx) => (
          line.type === 'vertical' ? (
            <div key={`snap-v-${idx}`} className="absolute w-[1px] bg-red-400 dark:bg-pink-500 z-[70] pointer-events-none" style={{ left: line.position, top: -5000, height: 10000 }} />
          ) : (
            <div key={`snap-h-${idx}`} className="absolute h-[1px] bg-red-400 dark:bg-pink-500 z-[70] pointer-events-none" style={{ top: line.position, left: -5000, width: 10000 }} />
          )
        ))}
        
        {/* Polygon Snapping Guidelines */}
        {polygonSnapLines.map((line, idx) => (
          line.type === 'vertical' ? (
            <div key={`psnap-v-${idx}`} className="absolute w-[1px] bg-pink-400 dark:bg-pink-500 z-[75] pointer-events-none" style={{ left: line.position, top: -5000, height: 10000 }} />
          ) : (
            <div key={`psnap-h-${idx}`} className="absolute h-[1px] bg-pink-400 dark:bg-pink-500 z-[75] pointer-events-none" style={{ top: line.position, left: -5000, width: 10000 }} />
          )
        ))}
        
        {/* Selection Box Rendering */}
        {selectionBox && (
          <div 
            className="absolute border border-blue-500 bg-blue-500/10 z-[100] pointer-events-none"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height
            }}
          />
        )}
        
        {/* Group Bounding Box (inside canvas-content to inherit transform) */}
        {(() => {
          if (selectedIds.length <= 1) return null;

          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          let hasSelectionGroup = false;

          classes.forEach(c => {
            if (selectedIds.includes(c.id)) {
              const w = c.width;
              const h = c.height || 100;
              if (c.rotation) {
                const cx = c.x + w / 2;
                const cy = c.y + h / 2;
                const rad = c.rotation * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const pts = [
                  {x: c.x, y: c.y}, {x: c.x + w, y: c.y},
                  {x: c.x + w, y: c.y + h}, {x: c.x, y: c.y + h}
                ];
                pts.forEach(p => {
                  const rx = (p.x - cx) * cos - (p.y - cy) * sin + cx;
                  const ry = (p.x - cx) * sin + (p.y - cy) * cos + cy;
                  minX = Math.min(minX, rx); minY = Math.min(minY, ry);
                  maxX = Math.max(maxX, rx); maxY = Math.max(maxY, ry);
                });
              } else {
                minX = Math.min(minX, c.x);
                minY = Math.min(minY, c.y);
                maxX = Math.max(maxX, c.x + w);
                maxY = Math.max(maxY, c.y + h);
              }
              hasSelectionGroup = true;
            }
          });
          arrows.forEach(a => {
            if (selectedIds.includes(a.id)) {
              const startPt = getAttachedPos(classes, a.start.attachedTo, a.start.anchorIndex, a.start);
              const endPt = getAttachedPos(classes, a.end.attachedTo, a.end.anchorIndex, a.end);
              const pts = [startPt, ...(a.controlPoints || []), endPt];
              pts.forEach(p => {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
                hasSelectionGroup = true;
              });
            }
          });

          if (!hasSelectionGroup) return null;
          
          const isGroupRotatable = selectedIds.every(id => {
            const c = classes.find(x => x.id === id);
            return c && ['polygon', 'shape', 'image', 'comment'].includes(c.type || '');
          });

          return (
            <div
              className="absolute border-2 border-dashed border-blue-500 bg-blue-500/5 z-[80] pointer-events-none"
              style={{
                left: minX - 15,
                top: minY - 15,
                width: maxX - minX + 30,
                height: maxY - minY + 30,
              }}
            >
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-1.5 rounded cursor-move pointer-events-auto shadow-md flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-transform"
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  e.stopPropagation();
                  startDrag({
                    targetId: 'selection-group',
                    type: 'selection-group',
                    startX: e.clientX,
                    startY: e.clientY
                  });
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const bounds = canvasRef.current!.getBoundingClientRect();
                  const firstTarget = classes.find(c => selectedIds.includes(c.id))?.id || arrows.find(a => selectedIds.includes(a.id))?.id;
                  if (firstTarget) {
                    openContextMenu({
                      type: firstTarget.startsWith('arrow-') ? 'arrow' : 'class',
                      x: e.clientX - bounds.left,
                      y: e.clientY - bounds.top,
                      targetId: firstTarget
                    });
                  }
                }}
                title="Drag Group"
              >
                <Move size={14} />
              </div>
              
              {isGroupRotatable && (
                <div
                  className="absolute left-1/2 -top-16 w-6 h-6 -translate-x-1/2 cursor-crosshair flex flex-col items-center justify-center z-20 pointer-events-auto group"
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    startDrag({ targetId: 'selection-group', type: 'selection-group-rotate', startX: e.clientX, startY: e.clientY });
                  }}
                  title="Rotate Group"
                >
                  <div className="w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full shadow-sm group-hover:scale-125 transition-transform"></div>
                  <div className="w-[1.5px] h-4 bg-blue-500 mt-0.5 opacity-50"></div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Polygon Drawing Overlay */}
      {isDrawingPolygon && (
        <div className="absolute top-0 left-0 w-full h-full z-[150] cursor-crosshair pointer-events-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg className="w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {pendingPolygonVertices.length > 0 && (
              <>
                <polyline 
                  points={[...pendingPolygonVertices, mousePos || pendingPolygonVertices[pendingPolygonVertices.length - 1]].map(p => `${p.x},${p.y}`).join(' ')} 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth={2 / zoom} 
                  strokeDasharray={`${4/zoom},${4/zoom}`} 
                />
                {pendingPolygonVertices.map((p, i) => {
                  const isSnapped = i === 0 && mousePos && Math.hypot(p.x - mousePos.x, p.y - mousePos.y) < 1;
                  return (
                    <circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r={isSnapped ? 8 / zoom : (i === 0 ? 6 / zoom : 4 / zoom)} 
                      fill={isSnapped ? "#34d399" : (i === 0 ? "#10b981" : "#ec4899")} 
                      className={isSnapped ? "transition-all duration-200" : ""}
                    />
                  );
                })}
              </>
            )}
          </svg>
        </div>
      )}

      {/* Arrow Drawing Overlay */}
      {pendingArrowType && (
        <div 
          className="absolute top-0 left-0 w-full h-full z-[200] cursor-crosshair"
          onMouseDown={(e) => {
            if (e.button !== 0) {
              setPendingArrowType(null);
              return;
            }
            e.preventDefault();
            const bounds = canvasRef.current!.getBoundingClientRect();
            const localX = (e.clientX - bounds.left - pan.x) / zoom;
            const localY = (e.clientY - bounds.top - pan.y) / zoom;
            startDrawingArrow(pendingArrowType, localX, localY, e.clientX, e.clientY);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setPendingArrowType(null);
          }}
        />
      )}

      {/* Pending Item Drawing Overlay */}
      {pendingItemType && (
        <div 
          className="absolute top-0 left-0 w-full h-full z-[200] cursor-crosshair"
          onMouseDown={(e) => {
            if (e.button !== 0) {
              setPendingItemType(null);
              setPendingImageData(null);
              return;
            }
            e.preventDefault();
            const bounds = canvasRef.current!.getBoundingClientRect();
            const localX = (e.clientX - bounds.left - pan.x) / zoom;
            const localY = (e.clientY - bounds.top - pan.y) / zoom;
            
            let newId: string | null = null;
            let defW = 240, defH = 100;
            
            if (pendingItemType === 'class') { newId = addClass(localX, localY, defW, defH); defW = 240; defH = 100; }
            else if (pendingItemType === 'text') { newId = addTextBox(localX, localY, defW, defH); defW = 240; defH = 100; }
            else if (pendingItemType === 'comment') { newId = addComment(localX, localY, defW, defH); defW = 120; defH = 40; }
            else if (pendingItemType === 'shape' && pendingShapeType) {
              if (pendingShapeType === 'cloud') {
                defW = 200;
                defH = 150;
              } else {
                defW = 200;
                defH = 200;
              }
              newId = addShape(pendingShapeType, localX, localY, 0, 0);
            }
            else if (pendingItemType === 'image' && pendingImageData) {
              defW = pendingImageData.width;
              defH = pendingImageData.height;
              newId = addImage(pendingImageData.url, defW, defH, localX, localY, true);
            }
            
            if (newId) {
              startDrag({ targetId: newId, type: 'draw-item', startX: localX, startY: localY, initialPositions: { defaults: { w: defW, h: defH } } });
            }
            
            setPendingItemType(null);
            setPendingImageData(null);
            setPendingShapeType(null);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setPendingItemType(null);
            setPendingImageData(null);
            setPendingShapeType(null);
          }}
        />
      )}

      {/* Tool Overlay to prevent interaction with elements */}
      {(tool === 'hand' || tool === 'zoom') && (
        <div id="tool-overlay" className="absolute top-0 left-0 w-full h-full z-[50]" />
      )}

      <ContextMenu />
    </div>
  );
};