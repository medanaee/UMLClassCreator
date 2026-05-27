import type { StateCreator } from 'zustand';
import type { AppState, ArrowSlice, UmlArrowType } from './types';
import { getClassAnchors } from './utils';

export const createArrowSlice: StateCreator<
  AppState,
  [],
  [],
  ArrowSlice
> = (set, get) => ({
  pendingArrowType: null,

  setPendingArrowType: (type) => set(state => ({ pendingArrowType: state.pendingArrowType === type ? null : type, pendingItemType: null, isDrawingPolygon: false })),

  startDrawingArrow: (type, localX, localY, screenX, screenY) => set(state => {
    let closestDist = 25;
    let attachedTo: string | null = null;
    let anchorIndex = -1;
    let finalStartX = localX;
    let finalStartY = localY;

    state.classes.forEach(cls => {
      const estimatedHeight = cls.height || (38 + 20 + 30 + (cls.items.length * 30));
      const points = getClassAnchors(cls, estimatedHeight);
      points.forEach((pt, idx) => {
        const dist = Math.hypot(pt.x - localX, pt.y - localY);
        if (dist < closestDist) {
          closestDist = dist;
          attachedTo = cls.id;
          anchorIndex = idx;
          finalStartX = pt.x;
          finalStartY = pt.y;
        }
      });
    });

    const newId = 'arrow-' + Date.now();
    const newArrow: UmlArrowType = {
      id: newId, type,
      start: { x: finalStartX, y: finalStartY, attachedTo, anchorIndex }, controlPoints: [], end: { x: localX, y: localY, attachedTo: null, anchorIndex: -1 },
      startLabel: ' ', middleLabel: ' ', endLabel: ' ',
      startLabelOffset: { x: 0, y: 0 }, middleLabelOffset: { x: 0, y: 0 }, endLabelOffset: { x: 0, y: 0 },
      startLabelRotation: 0, middleLabelRotation: 0, endLabelRotation: 0,
      startLabelFontSize: 14, middleLabelFontSize: 14, endLabelFontSize: 14
    };

    return {
      arrows: [...state.arrows, newArrow], selectedIds: [newId], pendingArrowType: null, showAnchors: true,
      dragState: { targetId: newId, type: 'end', offsetX: 0, offsetY: 0, startX: screenX, startY: screenY, initialPositions: {}, subTarget: null }
    };
  }),

  deleteArrow: (id) => {
    set((state) => ({ arrows: state.arrows.filter(a => a.id !== id), selectedIds: state.selectedIds.filter(sid => sid !== id) }));
    get().commitHistory();
  },

  updateArrow: (id, updates) => set((state) => ({ arrows: state.arrows.map(a => a.id === id ? { ...a, ...updates } : a) })),

  updateAttachedArrows: () => set((state) => state),
});