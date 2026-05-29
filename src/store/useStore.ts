import { create } from 'zustand';
import { getAttachedPos, getClassAnchors, getOffsetPos, base64ToBlobUrl } from "./utils.ts"
import type { AppState, Point, SnapLine, UmlArrowType, UmlClassType } from './types.ts';
import { createHistorySlice } from './historySlice.ts';
import { createCanvasSlice } from './canvasSlice.ts';
import { createElementSlice } from './elementSlice.ts';
import { createArrowSlice } from './arrowSlice.ts';
import { createSelectionSlice } from './selectionSlice.ts';
import { createDragSlice } from './dragSlice.ts';


export const useStore = create<AppState>((set, get, api) => ({
  ...createHistorySlice(set, get, api),
  ...createCanvasSlice(set, get, api),
  ...createElementSlice(set, get, api),
  ...createArrowSlice(set, get, api),
  ...createSelectionSlice(set, get, api),
  ...createDragSlice(set, get, api),

  classes: [],
  arrows: [],
  selectedIds: [],
  contextMenu: null,
  clipboard: null,
  alignKeyId: null,
  
  alert: null,
  showAlert: (message, type = 'info') => set({ alert: { message, type, id: Date.now() } }),
  hideAlert: () => set({ alert: null }),

  loadProject: (data) => set((state) => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.classes) && Array.isArray(parsed.arrows)) {
        const loadedClasses = parsed.classes.map((c: any) => {
          if (c.type === 'image' && c.imageUrl?.startsWith('data:')) {
            return { ...c, imageUrl: base64ToBlobUrl(c.imageUrl) };
          }
          return c;
        });

        return {
          classes: loadedClasses,
          arrows: parsed.arrows.map((a: any) => ({
            ...a,
            controlPoints: a.controlPoints || (a.cp1 && a.cp2 ? [a.cp1, a.cp2] : [])
          })), 
          selectedIds: [],
          contextMenu: null,
          pan: { x: 0, y: 0 },
          zoom: 1,
          selectionBox: null,
          past: [{ classes: loadedClasses, arrows: parsed.arrows.map((a: any) => ({...a, controlPoints: a.controlPoints || (a.cp1 && a.cp2 ? [a.cp1, a.cp2] : [])})) }],
          future: []
        };
      } else {
      get().showAlert('Invalid file format.', 'error');
      }
    } catch (err) {
      console.error(err);
    get().showAlert('Error reading file.', 'error');
    }
    return state;
  }),
}));    